#!/usr/bin/env bash
#
# Gas Town Remote - Install Script
# Installs Claude Code, Gas Town (gt/bd), and supporting tools on a fresh VPS
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/xxx/gastown-remote/main/install.sh | bash
#   # or
#   ./install.sh
#
# Idempotent: safe to run multiple times

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "Unsupported OS. This script requires Ubuntu 22.04 or 24.04."
        exit 1
    fi

    if [[ "$OS" != "ubuntu" ]]; then
        log_warn "This script is tested on Ubuntu. Your OS ($OS) may work but is unsupported."
    fi

    log_info "Detected OS: $OS $VERSION"
}

# Install system packages
install_system_packages() {
    log_info "Installing system packages..."

    sudo apt-get update -qq
    sudo apt-get install -y -qq \
        curl \
        git \
        tmux \
        jq \
        unzip \
        build-essential \
        ca-certificates \
        gnupg \
        ripgrep \
        htop \
        > /dev/null

    log_success "System packages installed"
}

# Install Node.js via NodeSource
install_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js already installed: $NODE_VERSION"
        return
    fi

    log_info "Installing Node.js 20.x..."

    # NodeSource setup
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y -qq nodejs > /dev/null

    log_success "Node.js installed: $(node --version)"
}

# Install Go
install_go() {
    GO_VERSION="1.23.4"

    if command -v go &> /dev/null; then
        CURRENT_GO=$(go version | awk '{print $3}' | sed 's/go//')
        log_success "Go already installed: $CURRENT_GO"
        return
    fi

    log_info "Installing Go $GO_VERSION..."

    curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" -o /tmp/go.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf /tmp/go.tar.gz
    rm /tmp/go.tar.gz

    # Add to path for this session
    export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

    log_success "Go installed: $(go version | awk '{print $3}')"
}

# Install GitHub CLI
install_gh() {
    if command -v gh &> /dev/null; then
        log_success "GitHub CLI already installed: $(gh --version | head -1)"
        return
    fi

    log_info "Installing GitHub CLI..."

    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg 2>/dev/null
    sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt-get update -qq
    sudo apt-get install -y -qq gh > /dev/null

    log_success "GitHub CLI installed: $(gh --version | head -1)"
}

# Install Claude Code CLI
install_claude() {
    if command -v claude &> /dev/null; then
        log_success "Claude Code already installed"
        return
    fi

    log_info "Installing Claude Code CLI..."

    sudo npm install -g @anthropic-ai/claude-code > /dev/null 2>&1

    log_success "Claude Code installed"
}

# Install Gas Town (gt and bd)
install_gastown() {
    export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

    if command -v gt &> /dev/null && command -v bd &> /dev/null; then
        log_success "Gas Town (gt, bd) already installed"
        return
    fi

    log_info "Installing Gas Town (gt, bd)..."

    go install github.com/steveyegge/gastown/cmd/gt@latest 2>/dev/null || {
        log_warn "gt install failed - may not be published yet"
    }

    go install github.com/steveyegge/beads/cmd/bd@latest 2>/dev/null || {
        log_warn "bd install failed - may not be published yet"
    }

    if command -v gt &> /dev/null; then
        log_success "Gas Town installed"
    else
        log_warn "Gas Town binaries not in PATH yet. Add ~/go/bin to PATH."
    fi
}

# Configure shell environment
configure_shell() {
    log_info "Configuring shell environment..."

    SHELL_RC="$HOME/.bashrc"
    MARKER="# gastown-remote"

    # Check if already configured
    if grep -q "$MARKER" "$SHELL_RC" 2>/dev/null; then
        log_success "Shell already configured"
        return
    fi

    cat >> "$SHELL_RC" << 'EOF'

# gastown-remote
export PATH="$PATH:/usr/local/go/bin:$HOME/go/bin"

# Auto-attach to tmux on SSH login (skip if already in tmux or not interactive)
if [[ -z "$TMUX" ]] && [[ -n "$SSH_CONNECTION" ]] && [[ $- == *i* ]]; then
    tmux attach -t main 2>/dev/null || tmux new -s main
fi
EOF

    log_success "Shell configured (auto-attach to tmux enabled)"
}

# Install systemd services
install_systemd_services() {
    log_info "Installing systemd services..."

    # Create gastown-tmux service
    sudo tee /etc/systemd/system/gastown-tmux.service > /dev/null << EOF
[Unit]
Description=Gas Town tmux session
After=network.target

[Service]
Type=forking
User=$USER
ExecStart=/usr/bin/tmux new-session -d -s main
ExecStop=/usr/bin/tmux kill-session -t main
RemainAfterExit=yes
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable gastown-tmux.service > /dev/null 2>&1
    sudo systemctl start gastown-tmux.service 2>/dev/null || true

    log_success "Systemd services installed"
}

# Configure tmux
configure_tmux() {
    log_info "Configuring tmux..."

    TMUX_CONF="$HOME/.tmux.conf"

    if [[ -f "$TMUX_CONF" ]]; then
        log_success "tmux config already exists"
        return
    fi

    cat > "$TMUX_CONF" << 'EOF'
# Gas Town tmux config

# Use Ctrl-a as prefix (easier on mobile keyboards)
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# Enable mouse support
set -g mouse on

# Start windows and panes at 1, not 0
set -g base-index 1
setw -g pane-base-index 1

# Increase scrollback buffer
set -g history-limit 50000

# Faster key repetition
set -s escape-time 0

# Activity monitoring
setw -g monitor-activity on
set -g visual-activity off

# Status bar
set -g status-style 'bg=#333333 fg=#ffffff'
set -g status-left '[#S] '
set -g status-right '%H:%M '

# Reload config
bind r source-file ~/.tmux.conf \; display "Reloaded!"

# Split panes with | and -
bind | split-window -h
bind - split-window -v

# Easy pane switching
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -n M-Up select-pane -U
bind -n M-Down select-pane -D
EOF

    log_success "tmux configured"
}

# Print next steps
print_next_steps() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Gas Town Remote - Installation Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BLUE}Next steps:${NC}"
    echo ""
    echo "  1. Start a new shell or run: source ~/.bashrc"
    echo ""
    echo "  2. Authenticate Claude Code (one-time):"
    echo "     $ claude"
    echo "     > /login"
    echo "     # Follow browser link, paste auth code"
    echo ""
    echo "  3. Authenticate GitHub CLI (one-time):"
    echo "     $ gh auth login"
    echo ""
    echo "  4. Initialize Gas Town:"
    echo "     $ gt install ~/gt"
    echo ""
    echo "  5. Add a rig (your first project):"
    echo "     $ gt rig add myproject https://github.com/you/repo.git"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Main
main() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           Gas Town Remote - Installation Script               ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    detect_os
    install_system_packages
    install_nodejs
    install_go
    install_gh
    install_claude
    install_gastown
    configure_shell
    configure_tmux
    install_systemd_services
    print_next_steps
}

main "$@"
