# Gas Town Remote

Always-on AI agent orchestration in the cloud. Run [Gas Town](https://github.com/steveyegge/gastown) on a VPS, access from anywhere via Tailscale.

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR PHONE (Tailscale)                       │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   HETZNER VPS ($4/mo)                     │  │
│  │                                                           │  │
│  │  ssh gastown@your-tailnet → tmux attach → claude          │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  tmux: main                                         │  │  │
│  │  │  ├── Claude Code (your AI assistant)                │  │  │
│  │  │  └── Gas Town (gt/bd - agent orchestration)         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Why?

- **Always-on**: Your AI agents run 24/7, not just when your laptop is open
- **Access from anywhere**: SSH from your phone via Tailscale
- **Cheap**: ~$4/month on Hetzner CX22
- **Simple**: Bare metal, systemd, tmux - no Docker complexity
- **Open source**: Deploy your own, customize everything

## Three Ways to Deploy

Choose the method that works best for you:

| Method | Best For | Requirements |
|--------|----------|--------------|
| [🌐 Web Wizard](#option-1-web-wizard-recommended) | Everyone, phone-friendly | Just a browser |
| [🔧 GitHub Actions](#option-2-github-actions) | Automated deploys | GitHub account |
| [💻 CLI Script](#option-3-cli-laptop) | Power users | Laptop + terminal |

---

## Option 1: Web Wizard (Recommended)

**No laptop needed. No tokens shared with us.**

1. Visit **[gastown.dev](https://gastown.dev)** (or run locally: `cd web && npm run dev`)
2. Enter your server name and Tailscale auth key
3. Copy the generated config
4. Paste into Hetzner console when creating server
5. Wait 3-5 minutes, connect via Tailscale

**Your credentials never leave your browser.**

---

## Option 2: GitHub Actions

**Phone-friendly via GitHub mobile app.**

### Setup (one-time)

1. **Fork this repo** → [Fork on GitHub](https://github.com/xxx/gastown-remote/fork)

2. **Add secrets** (Settings → Secrets → Actions):
   - `HETZNER_TOKEN` - Get from [console.hetzner.cloud](https://console.hetzner.cloud)
   - `TAILSCALE_KEY` - Get from [tailscale.com/admin/settings/keys](https://login.tailscale.com/admin/settings/keys)

3. **Run workflow** (Actions → "Deploy Gas Town" → Run workflow)

4. **Connect** when done:
   ```bash
   ssh gastown@gastown
   ```

---

## Option 3: CLI (Laptop)

**Full control via terminal.**

### Prerequisites

- [Hetzner account](https://console.hetzner.cloud) with API token
- [Tailscale account](https://tailscale.com) with auth key
- `hcloud` CLI: `brew install hcloud` (macOS) or [install guide](https://github.com/hetznercloud/cli)

### Deploy

```bash
# Clone this repo
git clone https://github.com/xxx/gastown-remote.git
cd gastown-remote

# Deploy to Hetzner
./deploy/hetzner/deploy.sh \
  --tailscale-key tskey-auth-xxxxx \
  --hetzner-token xxxxx

# Wait ~3 minutes, then connect:
ssh gastown@gastown
```

### Custom options

```bash
./deploy/hetzner/deploy.sh \
  --name my-gastown \
  --type cx32 \           # 8GB RAM (default: cx22)
  --location ash \        # US East (default: nbg1)
  --tailscale-key xxx \
  --hetzner-token xxx
```

---

## First-Time Setup (All Methods)

After your server is running, connect and authenticate:

```bash
# Connect via Tailscale
ssh gastown@gastown

# Authenticate Claude Code (one-time)
claude
> /login
# Follow browser link, paste code

# Authenticate GitHub (one-time)
gh auth login

# Initialize Gas Town
gt install ~/gt

# Add your first project
gt rig add myproject https://github.com/you/repo.git
```

---

## Daily Usage

```bash
# From your phone or any device with Tailscale
ssh gastown

# You're automatically in tmux with Claude ready
claude
```

---

## Architecture

No Docker. Just a VPS with:

| Component | Purpose |
|-----------|---------|
| **Tailscale** | Secure access from anywhere |
| **tmux** | Persistent sessions that survive disconnects |
| **Claude Code** | Your AI coding assistant |
| **Gas Town (gt/bd)** | Agent orchestration framework |
| **systemd** | Service management |

```
Hetzner VPS (Ubuntu 24.04)
├── tailscaled           ← Secure networking
├── systemd
│   └── gastown-tmux     ← Persistent tmux session
├── ~/gt/                ← Gas Town workspace
│   └── <your-rigs>/     ← Your projects
└── ~/.claude/           ← Claude authentication
```

---

## Mobile Access

### Recommended SSH Apps

| Platform | App | Notes |
|----------|-----|-------|
| iOS | [Blink Shell](https://blink.sh) | Best iOS terminal, Tailscale built-in |
| iOS | [Termius](https://termius.com) | Free tier works well |
| Android | [Termux](https://termux.dev) | Install Tailscale via F-Droid |
| Android | [JuiceSSH](https://juicessh.com) | Simple, works with Tailscale |

### tmux Tips for Mobile

The config is optimized for mobile:
- `Ctrl-a` prefix (easier than `Ctrl-b` on phone keyboards)
- Mouse support enabled
- Larger scrollback buffer

---

## Bring Your Own VPS

Run on any Ubuntu 22.04+ VPS:

```bash
# SSH to your VPS
ssh root@your-server

# Create user
adduser gastown
usermod -aG sudo gastown
su - gastown

# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh

# Clone and install
git clone https://github.com/xxx/gastown-remote.git
./gastown-remote/install.sh
```

---

## Cost

| Provider | Plan | Specs | Monthly |
|----------|------|-------|---------|
| Hetzner | CX22 | 2 vCPU, 4GB RAM, 40GB SSD | ~$4 |
| Hetzner | CX32 | 4 vCPU, 8GB RAM, 80GB SSD | ~$8 |
| DigitalOcean | Basic | 1 vCPU, 2GB RAM, 50GB SSD | ~$12 |

CX22 is plenty for most Gas Town workloads.

---

## Updates

```bash
ssh gastown

# Pull latest
cd ~/gastown-remote
git pull

# Re-run install (idempotent)
./install.sh

# Update Gas Town binaries
go install github.com/steveyegge/gastown/cmd/gt@latest
go install github.com/steveyegge/beads/cmd/bd@latest
```

---

## Troubleshooting

### Can't connect via Tailscale

```bash
# Check status (via Hetzner console)
tailscale status

# Re-authenticate
sudo tailscale up --ssh --reset
```

### tmux session lost

```bash
sudo systemctl status gastown-tmux
sudo systemctl restart gastown-tmux
```

### Claude Code auth issues

```bash
claude
> /logout
> /login
```

---

## Project Structure

```
gastown-remote/
├── install.sh                    # Main install script (runs on VPS)
├── deploy/
│   └── hetzner/
│       ├── deploy.sh             # CLI deploy script
│       └── cloud-init.yml        # Server bootstrap config
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions workflow
├── web/                          # Web wizard (Next.js)
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   └── wizard/page.tsx       # Config generator
│   └── lib/
│       └── generate-config.ts    # Cloud-init generator
└── scripts/
    ├── attach.sh                 # tmux attach helper
    └── setup-auth.sh             # First-time auth guide
```

---

## Contributing

Issues and PRs welcome. This is open source and free to use.

## License

MIT
