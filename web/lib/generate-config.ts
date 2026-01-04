export interface ConfigOptions {
  serverName: string
  tailscaleKey: string
}

export function generateCloudInit(options: ConfigOptions): string {
  const { serverName, tailscaleKey } = options

  return `#cloud-config
#
# Gas Town Remote - Cloud Init Configuration
# Generated at: ${new Date().toISOString()}
#
# Paste this into Hetzner's "Cloud config" field when creating your server.
# Your Tailscale key is embedded - do not share this config publicly.

users:
  - name: gastown
    groups: sudo
    shell: /bin/bash
    sudo: ALL=(ALL) NOPASSWD:ALL

package_update: true
package_upgrade: true

packages:
  - curl
  - git
  - tmux
  - jq
  - unzip
  - ca-certificates
  - gnupg
  - build-essential
  - ripgrep
  - htop

write_files:
  - path: /etc/motd
    content: |

       ╔═══════════════════════════════════════════════════════════╗
       ║                    GAS TOWN REMOTE                        ║
       ║                                                           ║
       ║  Connect: ssh gastown@${serverName}                       ║
       ║  Claude:  claude                                          ║
       ╚═══════════════════════════════════════════════════════════╝

  - path: /home/gastown/.hushlogin
    content: ""

  - path: /home/gastown/.tmux.conf
    content: |
      set -g prefix C-a
      unbind C-b
      bind C-a send-prefix
      set -g mouse on
      set -g base-index 1
      setw -g pane-base-index 1
      set -g history-limit 50000
      set -s escape-time 0
      setw -g monitor-activity on
      set -g visual-activity off
      set -g status-style 'bg=#333333 fg=#ffffff'
      set -g status-left '[#S] '
      set -g status-right '%H:%M '
      bind r source-file ~/.tmux.conf \\; display "Reloaded!"
      bind | split-window -h
      bind - split-window -v

runcmd:
  # Install Tailscale
  - curl -fsSL https://tailscale.com/install.sh | sh
  - tailscale up --auth-key=${tailscaleKey} --ssh --hostname=${serverName}

  # Install Node.js
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs

  # Install Go
  - curl -fsSL "https://go.dev/dl/go1.23.4.linux-amd64.tar.gz" -o /tmp/go.tar.gz
  - rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go.tar.gz
  - rm /tmp/go.tar.gz

  # Install GitHub CLI
  - curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  - chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
  - echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  - apt-get update && apt-get install -y gh

  # Install Claude Code
  - npm install -g @anthropic-ai/claude-code

  # Install Gas Town (gt and bd)
  - su - gastown -c "export PATH=\\$PATH:/usr/local/go/bin && go install github.com/steveyegge/gastown/cmd/gt@latest" || true
  - su - gastown -c "export PATH=\\$PATH:/usr/local/go/bin && go install github.com/steveyegge/beads/cmd/bd@latest" || true

  # Configure shell for gastown user
  - |
    cat >> /home/gastown/.bashrc << 'BASHRC_EOF'

    # gastown-remote
    export PATH="$PATH:/usr/local/go/bin:$HOME/go/bin"

    # Auto-attach to tmux on SSH login
    if [[ -z "$TMUX" ]] && [[ -n "$SSH_CONNECTION" ]] && [[ $- == *i* ]]; then
        tmux attach -t main 2>/dev/null || tmux new -s main
    fi
    BASHRC_EOF

  # Fix ownership
  - chown -R gastown:gastown /home/gastown

  # Create systemd service for tmux
  - |
    cat > /etc/systemd/system/gastown-tmux.service << 'SYSTEMD_EOF'
    [Unit]
    Description=Gas Town tmux session
    After=network.target

    [Service]
    Type=forking
    User=gastown
    ExecStart=/usr/bin/tmux new-session -d -s main
    ExecStop=/usr/bin/tmux kill-session -t main
    RemainAfterExit=yes
    Restart=on-failure
    RestartSec=5

    [Install]
    WantedBy=multi-user.target
    SYSTEMD_EOF

  - systemctl daemon-reload
  - systemctl enable gastown-tmux.service
  - systemctl start gastown-tmux.service

final_message: "Gas Town Remote is ready! Connect via: ssh gastown@${serverName}"
`
}

export function validateServerName(name: string): string | null {
  if (!name) return 'Server name is required'
  if (name.length < 2) return 'Server name must be at least 2 characters'
  if (name.length > 63) return 'Server name must be 63 characters or less'
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) {
    return 'Server name must start with a letter, contain only lowercase letters, numbers, and hyphens'
  }
  if (/^[a-z]$/.test(name)) return null // single letter is ok
  return null
}

export function validateTailscaleKey(key: string): string | null {
  if (!key) return 'Tailscale auth key is required'
  if (!key.startsWith('tskey-auth-')) {
    return 'Tailscale auth key should start with "tskey-auth-"'
  }
  if (key.length < 20) return 'Tailscale auth key seems too short'
  return null
}
