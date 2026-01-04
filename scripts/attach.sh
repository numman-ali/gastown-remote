#!/usr/bin/env bash
#
# Gas Town Remote - Attach to main tmux session
# Wrapper script for convenient session attachment

set -euo pipefail

SESSION_NAME="${1:-main}"

# Check if session exists
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    exec tmux attach -t "$SESSION_NAME"
else
    echo "Session '$SESSION_NAME' not found. Creating..."
    exec tmux new -s "$SESSION_NAME"
fi
