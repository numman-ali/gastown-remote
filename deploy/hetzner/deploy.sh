#!/usr/bin/env bash
#
# Gas Town Remote - Hetzner One-Click Deploy
#
# Creates a Hetzner VPS with Gas Town pre-installed, accessible via Tailscale.
#
# Prerequisites:
#   - hcloud CLI installed: brew install hcloud (macOS) or apt install hcloud-cli
#   - Hetzner API token: https://console.hetzner.cloud/projects/*/security/tokens
#   - Tailscale auth key: https://login.tailscale.com/admin/settings/keys
#
# Usage:
#   ./deploy.sh --tailscale-key tskey-auth-xxx --hetzner-token xxx
#   ./deploy.sh --tailscale-key tskey-auth-xxx  # Uses HCLOUD_TOKEN env var

set -euo pipefail

# Defaults
SERVER_NAME="${SERVER_NAME:-gastown}"
SERVER_TYPE="${SERVER_TYPE:-cx22}"  # 2 vCPU, 4GB RAM, 40GB SSD - ~$4/month
SERVER_LOCATION="${SERVER_LOCATION:-nbg1}"  # Nuremberg, Germany
SERVER_IMAGE="${SERVER_IMAGE:-ubuntu-24.04}"
SSH_KEY_NAME="${SSH_KEY_NAME:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Parse arguments
TAILSCALE_KEY=""
HETZNER_TOKEN="${HCLOUD_TOKEN:-}"
SSH_PUBLIC_KEY=""

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Required:
  --tailscale-key KEY    Tailscale auth key (create at tailscale.com/admin/settings/keys)

Optional:
  --hetzner-token TOKEN  Hetzner API token (or set HCLOUD_TOKEN env var)
  --name NAME            Server name (default: gastown)
  --type TYPE            Server type (default: cx22 - 2vCPU/4GB/40GB)
  --location LOC         Server location (default: nbg1 - Nuremberg)
  --ssh-key NAME         Name of SSH key in Hetzner (for backup access)
  --ssh-public-key KEY   SSH public key string (alternative to --ssh-key)

Example:
  $0 --tailscale-key tskey-auth-xxx --hetzner-token xxx
  $0 --tailscale-key tskey-auth-xxx --name my-gastown --type cx32

Locations: nbg1 (Nuremberg), fsn1 (Falkenstein), hel1 (Helsinki), ash (Ashburn)
Types: cx22 (4GB), cx32 (8GB), cx42 (16GB), cx52 (32GB)
EOF
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --tailscale-key) TAILSCALE_KEY="$2"; shift 2 ;;
        --hetzner-token) HETZNER_TOKEN="$2"; shift 2 ;;
        --name) SERVER_NAME="$2"; shift 2 ;;
        --type) SERVER_TYPE="$2"; shift 2 ;;
        --location) SERVER_LOCATION="$2"; shift 2 ;;
        --ssh-key) SSH_KEY_NAME="$2"; shift 2 ;;
        --ssh-public-key) SSH_PUBLIC_KEY="$2"; shift 2 ;;
        -h|--help) usage ;;
        *) log_error "Unknown option: $1" ;;
    esac
done

# Validate required args
[[ -z "$TAILSCALE_KEY" ]] && log_error "Missing --tailscale-key. Get one at https://login.tailscale.com/admin/settings/keys"
[[ -z "$HETZNER_TOKEN" ]] && log_error "Missing --hetzner-token or HCLOUD_TOKEN env var"

# Check hcloud CLI
if ! command -v hcloud &> /dev/null; then
    log_error "hcloud CLI not found. Install with: brew install hcloud (macOS) or see https://github.com/hetznercloud/cli"
fi

# Export token for hcloud
export HCLOUD_TOKEN="$HETZNER_TOKEN"

# Verify token works
log_info "Verifying Hetzner API access..."
if ! hcloud server list &> /dev/null; then
    log_error "Invalid Hetzner API token. Check your token at https://console.hetzner.cloud"
fi
log_success "Hetzner API access verified"

# Check if server already exists
if hcloud server describe "$SERVER_NAME" &> /dev/null; then
    log_error "Server '$SERVER_NAME' already exists. Delete it first or use a different name."
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLOUD_INIT_TEMPLATE="$SCRIPT_DIR/cloud-init.yml"

if [[ ! -f "$CLOUD_INIT_TEMPLATE" ]]; then
    log_error "cloud-init.yml not found at $CLOUD_INIT_TEMPLATE"
fi

# Generate cloud-init with substituted values
log_info "Generating cloud-init configuration..."
CLOUD_INIT_FINAL=$(mktemp)

# If no SSH key provided, use a placeholder that cloud-init will ignore
if [[ -z "$SSH_PUBLIC_KEY" ]]; then
    # Try to get from default location
    if [[ -f "$HOME/.ssh/id_ed25519.pub" ]]; then
        SSH_PUBLIC_KEY=$(cat "$HOME/.ssh/id_ed25519.pub")
    elif [[ -f "$HOME/.ssh/id_rsa.pub" ]]; then
        SSH_PUBLIC_KEY=$(cat "$HOME/.ssh/id_rsa.pub")
    else
        SSH_PUBLIC_KEY="ssh-ed25519 PLACEHOLDER_KEY_TAILSCALE_SSH_IS_PRIMARY"
        log_warn "No SSH key found. You'll use Tailscale SSH to connect."
    fi
fi

sed -e "s|{{TAILSCALE_AUTH_KEY}}|$TAILSCALE_KEY|g" \
    -e "s|{{SSH_PUBLIC_KEY}}|$SSH_PUBLIC_KEY|g" \
    "$CLOUD_INIT_TEMPLATE" > "$CLOUD_INIT_FINAL"

log_success "Cloud-init generated"

# Build hcloud command
HCLOUD_CMD="hcloud server create \
    --name $SERVER_NAME \
    --type $SERVER_TYPE \
    --location $SERVER_LOCATION \
    --image $SERVER_IMAGE \
    --user-data-from-file $CLOUD_INIT_FINAL"

# Add SSH key if specified
if [[ -n "$SSH_KEY_NAME" ]]; then
    HCLOUD_CMD="$HCLOUD_CMD --ssh-key $SSH_KEY_NAME"
fi

# Create server
echo ""
log_info "Creating Hetzner server..."
echo -e "  Name:     ${GREEN}$SERVER_NAME${NC}"
echo -e "  Type:     ${GREEN}$SERVER_TYPE${NC}"
echo -e "  Location: ${GREEN}$SERVER_LOCATION${NC}"
echo -e "  Image:    ${GREEN}$SERVER_IMAGE${NC}"
echo ""

eval "$HCLOUD_CMD"

# Cleanup temp file
rm -f "$CLOUD_INIT_FINAL"

# Get server IP
SERVER_IP=$(hcloud server ip "$SERVER_NAME")
log_success "Server created: $SERVER_IP"

# Wait for cloud-init
echo ""
log_info "Waiting for server to initialize (this takes 2-3 minutes)..."
echo "  Cloud-init is installing: Tailscale, Node.js, Go, Claude Code, Gas Town"
echo ""

# Poll for Tailscale to come online
MAX_WAIT=180  # 3 minutes
WAITED=0
TAILSCALE_READY=false

while [[ $WAITED -lt $MAX_WAIT ]]; do
    # Check if we can see the machine in Tailscale
    if tailscale status 2>/dev/null | grep -q "$SERVER_NAME"; then
        TAILSCALE_READY=true
        break
    fi
    sleep 10
    WAITED=$((WAITED + 10))
    echo -n "."
done
echo ""

if [[ "$TAILSCALE_READY" == "true" ]]; then
    TAILSCALE_HOSTNAME=$(tailscale status 2>/dev/null | grep "$SERVER_NAME" | awk '{print $2}' | head -1)
    log_success "Tailscale connected!"
else
    log_warn "Tailscale not detected yet. It may still be initializing."
    TAILSCALE_HOSTNAME="gastown"
fi

# Print success message
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Gas Town Remote - Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Server Details:${NC}"
echo -e "    Public IP:  $SERVER_IP"
echo -e "    Tailscale:  $TAILSCALE_HOSTNAME"
echo ""
echo -e "  ${BLUE}Connect via Tailscale SSH:${NC}"
echo -e "    ssh gastown@$TAILSCALE_HOSTNAME"
echo ""
echo -e "  ${BLUE}Or via public IP (if SSH key was added):${NC}"
echo -e "    ssh gastown@$SERVER_IP"
echo ""
echo -e "  ${BLUE}First-time setup (run after connecting):${NC}"
echo -e "    1. claude → /login  (authenticate Claude Code)"
echo -e "    2. gh auth login    (authenticate GitHub)"
echo -e "    3. gt install ~/gt  (initialize Gas Town)"
echo ""
echo -e "  ${BLUE}Monthly cost:${NC} ~\$4-6 USD (cx22)"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
