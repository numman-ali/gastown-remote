<p align="center">
  <img src="assets/banner.svg" alt="gastown-remote" width="500">
</p>

<p align="center">
  <a href="https://github.com/numman-ali/gastown-remote/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
  <a href="https://github.com/steveyegge/gastown">
    <img src="https://img.shields.io/badge/gas%20town-compatible-orange.svg" alt="Gas Town Compatible">
  </a>
  <a href="https://tailscale.com">
    <img src="https://img.shields.io/badge/tailscale-ready-00ADD8.svg" alt="Tailscale Ready">
  </a>
  <a href="https://twitter.com/nummanali">
    <img src="https://img.shields.io/twitter/follow/nummanali?style=social" alt="Follow on Twitter">
  </a>
</p>

<p align="center">
  <strong>Always-on AI agent orchestration in the cloud.</strong><br>
  Deploy <a href="https://github.com/steveyegge/gastown">Gas Town</a> to a VPS. Access from your phone via Tailscale. ~$4/month.
</p>

---

## The Problem

You want AI agents working for you 24/7, but:

- **Laptop dependency** — Agents die when you close your laptop
- **No mobile access** — Can't check on agents from your phone
- **Complex setups** — Docker, Kubernetes, container orchestration overkill

## The Solution

**gastown-remote** gives you an always-on AI workshop in the cloud. SSH in from anywhere, pick up where you left off, and let your agents keep running while you sleep.

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR PHONE (Tailscale)                       │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   HETZNER VPS (~$4/mo)                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  tmux: main                                         │  │  │
│  │  │  ├── Claude Code (your AI assistant)                │  │  │
│  │  │  └── Gas Town (gt/bd - agent orchestration)         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ssh gastown@your-server → tmux attach → claude          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Three Ways to Deploy

Choose what works for you. All three get you to the same destination.

| Method | Best For | Requirements |
|--------|----------|--------------|
| [Web Wizard](#-web-wizard) | Everyone, phone-friendly | Just a browser |
| [GitHub Actions](#-github-actions) | Automated deploys | GitHub account |
| [CLI Script](#-cli-script) | Power users | Laptop + terminal |

---

## Web Wizard

**No laptop needed. No tokens shared with us.**

The wizard generates a cloud-init config entirely in your browser. You paste it into Hetzner's console. Your credentials never touch our servers.

<p align="center">
  <strong>→ <a href="https://gastown.dev">gastown.dev</a> ←</strong><br>
  <sub>or run locally: <code>cd web && npm run dev</code></sub>
</p>

### How It Works

1. **Enter your details** — Server name + Tailscale auth key
2. **Copy the config** — Generated client-side in your browser
3. **Paste into Hetzner** — Cloud config field when creating server
4. **Wait 3-5 minutes** — Server boots, installs everything, joins Tailscale
5. **Connect** — `ssh gastown@your-server`

---

## GitHub Actions

**Phone-friendly via GitHub mobile app.**

Fork once, add secrets, trigger deployments from anywhere.

### Setup

```bash
# 1. Fork this repo
gh repo fork numman-ali/gastown-remote --clone=false

# 2. Add secrets (Settings → Secrets → Actions)
#    - HETZNER_TOKEN: from console.hetzner.cloud
#    - TAILSCALE_KEY: from tailscale.com/admin/settings/keys

# 3. Trigger workflow (Actions → "Deploy Gas Town" → Run workflow)
```

### From Your Phone

1. Open GitHub app
2. Navigate to your fork
3. Actions → Deploy Gas Town → Run workflow
4. Wait for completion, connect via Tailscale

---

## CLI Script

**Full control for power users.**

```bash
# Clone
git clone https://github.com/numman-ali/gastown-remote.git
cd gastown-remote

# Deploy
./deploy/hetzner/deploy.sh \
  --tailscale-key tskey-auth-xxxxx \
  --hetzner-token xxxxx

# Connect (after ~3 minutes)
ssh gastown@gastown
```

### Options

```bash
./deploy/hetzner/deploy.sh \
  --name my-gastown \          # Tailscale hostname (default: gastown)
  --type cx32 \                # 8GB RAM (default: cx22 / 4GB)
  --location ash \             # US East (default: nbg1 / Germany)
  --tailscale-key xxx \
  --hetzner-token xxx
```

---

## First-Time Setup

After your server is running, authenticate your tools:

```bash
# Connect
ssh gastown@gastown

# Claude Code (one-time)
claude
> /login
# Follow browser link, paste code

# GitHub CLI (one-time)
gh auth login

# Initialize Gas Town
gt install ~/gt

# Add your first project
gt rig add myproject https://github.com/you/repo.git
```

---

## What You Get

| Component | Purpose |
|-----------|---------|
| **Tailscale** | Secure access from anywhere (phone, laptop, tablet) |
| **tmux** | Persistent sessions that survive disconnects |
| **Claude Code** | AI coding assistant |
| **Gas Town (gt/bd)** | Agent orchestration framework |
| **systemd** | Auto-restart on reboot |

### Stack

```
Ubuntu 24.04 LTS
├── tailscaled           ← Secure networking
├── systemd
│   └── gastown-tmux     ← Persistent tmux session
├── ~/gt/                ← Gas Town workspace
│   └── <your-rigs>/     ← Your projects
└── ~/.claude/           ← Claude authentication
```

---

## Mobile Access

### Recommended Apps

| Platform | App | Notes |
|----------|-----|-------|
| iOS | [Blink Shell](https://blink.sh) | Best iOS terminal, Tailscale built-in |
| iOS | [Termius](https://termius.com) | Free tier works well |
| Android | [Termux](https://termux.dev) | Install Tailscale via F-Droid |
| Android | [JuiceSSH](https://juicessh.com) | Simple, works with Tailscale |

### tmux Tips

Config is optimized for mobile:

- **Prefix**: `Ctrl-a` (easier than `Ctrl-b` on phone keyboards)
- **Mouse**: Enabled
- **Scrollback**: 50,000 lines

---

## Cost

| Provider | Plan | Specs | Monthly |
|----------|------|-------|---------|
| **Hetzner** | CX22 | 2 vCPU, 4GB RAM, 40GB SSD | ~$4 |
| Hetzner | CX32 | 4 vCPU, 8GB RAM, 80GB SSD | ~$8 |
| DigitalOcean | Basic | 1 vCPU, 2GB RAM, 50GB SSD | ~$12 |

CX22 is plenty for most Gas Town workloads.

---

## Bring Your Own VPS

Run on any Ubuntu 22.04+ server:

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
git clone https://github.com/numman-ali/gastown-remote.git
./gastown-remote/install.sh
```

---

## Updates

```bash
# Pull latest
cd ~/gastown-remote && git pull

# Re-run install (idempotent)
./install.sh

# Update Gas Town
go install github.com/steveyegge/gastown/cmd/gt@latest
go install github.com/steveyegge/beads/cmd/bd@latest
```

---

## Troubleshooting

<details>
<summary><strong>Can't connect via Tailscale</strong></summary>

```bash
# Check status (via Hetzner console)
tailscale status

# Re-authenticate
sudo tailscale up --ssh --reset
```
</details>

<details>
<summary><strong>tmux session lost</strong></summary>

```bash
sudo systemctl status gastown-tmux
sudo systemctl restart gastown-tmux
```
</details>

<details>
<summary><strong>Claude Code auth issues</strong></summary>

```bash
claude
> /logout
> /login
```
</details>

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

## Philosophy

> **No Docker. No Kubernetes. No complexity.**

Just a VPS with tmux and systemd. Simple infrastructure that you can understand, debug, and trust. Your AI agents run in persistent sessions that survive disconnects, reboots, and network hiccups.

The goal is **zero friction** between you and your agents. SSH in, you're there. Close your phone, they keep working.

---

## Related Projects

- **[Gas Town](https://github.com/steveyegge/gastown)** — The agent orchestration framework
- **[n-skills](https://github.com/numman-ali/n-skills)** — Universal AI agent skills marketplace
- **[cc-mirror](https://github.com/numman-ali/cc-mirror)** — Multi-provider Claude Code variants

---

## Contributing

Issues and PRs welcome. This project is open source and free to use.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT — see [LICENSE](LICENSE)

---

<p align="center">
  <sub>Built by <a href="https://github.com/numman-ali">@numman-ali</a> · <a href="https://twitter.com/nummanali">@nummanali</a></sub>
</p>
