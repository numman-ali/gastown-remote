#!/usr/bin/env bash
#
# Gas Town Remote - First-time authentication setup
# Interactive guide for setting up Claude Code and GitHub authentication

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Gas Town Remote - Authentication Setup              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check Claude Code auth
echo -e "${BLUE}[1/3] Claude Code Authentication${NC}"
echo ""

if claude --version &> /dev/null; then
    # Try a simple command to check if authenticated
    if claude -p "echo test" &> /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Claude Code is authenticated${NC}"
    else
        echo -e "${YELLOW}  Claude Code needs authentication.${NC}"
        echo ""
        echo "  Run: claude"
        echo "  Then type: /login"
        echo "  Follow the browser link and paste the auth code."
        echo ""
        read -p "  Press Enter when done..."
    fi
else
    echo "  Claude Code not installed. Run install.sh first."
fi

echo ""

# Check GitHub CLI auth
echo -e "${BLUE}[2/3] GitHub CLI Authentication${NC}"
echo ""

if gh auth status &> /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ GitHub CLI is authenticated${NC}"
else
    echo -e "${YELLOW}  GitHub CLI needs authentication.${NC}"
    echo ""
    echo "  Run: gh auth login"
    echo "  Choose: GitHub.com → HTTPS → Authenticate with browser"
    echo ""
    read -p "  Press Enter when done..."
fi

echo ""

# Check Gas Town
echo -e "${BLUE}[3/3] Gas Town Initialization${NC}"
echo ""

if [[ -d "$HOME/gt" ]]; then
    echo -e "${GREEN}  ✓ Gas Town is initialized at ~/gt${NC}"
else
    echo -e "${YELLOW}  Gas Town not initialized.${NC}"
    echo ""
    echo "  Run: gt install ~/gt"
    echo ""
    read -p "  Press Enter when done..."
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup complete! You're ready to use Gas Town.${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Quick commands:"
echo "    claude          - Start Claude Code"
echo "    gt status       - Check Gas Town status"
echo "    gt rig add ...  - Add a project"
echo ""
