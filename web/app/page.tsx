import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">
          AI Agents in the Cloud
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Deploy Gas Town to your own VPS. Access Claude Code from your phone,
          anywhere in the world. Always on, always ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/wizard/"
            className="bg-gas-500 hover:bg-gas-600 text-black font-semibold px-8 py-4 rounded-lg text-lg transition-colors touch-target"
          >
            Deploy Now →
          </Link>
          <a
            href="https://github.com/numman-ali/gastown-remote"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-700 hover:border-gray-500 px-8 py-4 rounded-lg text-lg transition-colors touch-target"
          >
            View Source
          </a>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Deploy from Anywhere</h3>
            <p className="text-gray-400">
              No laptop needed. Generate your config, paste it into Hetzner,
              and your server is ready in 5 minutes.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Your Tokens Stay Private</h3>
            <p className="text-gray-400">
              We never see your API keys. Everything is generated client-side
              and pasted directly into your Hetzner account.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">~$4/month</h3>
            <p className="text-gray-400">
              Run on Hetzner's cheapest VPS. More than enough power for
              Claude Code and Gas Town agents.
            </p>
          </div>
        </div>
      </div>

      {/* Three options */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Choose Your Path</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Option 1: Web Wizard */}
          <div className="border border-gas-500 rounded-xl p-6 bg-gas-500/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌐</span>
              <span className="bg-gas-500 text-black text-xs px-2 py-1 rounded font-semibold">
                RECOMMENDED
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Web Wizard</h3>
            <p className="text-gray-400 mb-4">
              Works from your phone. Generate config, paste into Hetzner console.
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>✓ No laptop required</li>
              <li>✓ No tokens shared with us</li>
              <li>✓ 5 minute setup</li>
            </ul>
            <Link
              href="/wizard/"
              className="block text-center bg-gas-500 hover:bg-gas-600 text-black font-semibold px-4 py-3 rounded-lg transition-colors"
            >
              Start Wizard →
            </Link>
          </div>

          {/* Option 2: GitHub Actions */}
          <div className="border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">GitHub Actions</h3>
            <p className="text-gray-400 mb-4">
              Fork the repo, add secrets, trigger workflow. Fully automated.
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>✓ Phone-friendly (GitHub app)</li>
              <li>✓ Secrets in your account</li>
              <li>✓ One-click deploys</li>
            </ul>
            <a
              href="https://github.com/numman-ali/gastown-remote/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center border border-gray-600 hover:border-gray-400 px-4 py-3 rounded-lg transition-colors"
            >
              Fork Repo →
            </a>
          </div>

          {/* Option 3: CLI */}
          <div className="border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💻</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">CLI (Laptop)</h3>
            <p className="text-gray-400 mb-4">
              Clone repo, run deploy script. For those who prefer the terminal.
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>✓ Full control</li>
              <li>✓ Customizable</li>
              <li>✓ Scriptable</li>
            </ul>
            <a
              href="https://github.com/numman-ali/gastown-remote#cli-script"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center border border-gray-600 hover:border-gray-400 px-4 py-3 rounded-lg transition-colors"
            >
              View Docs →
            </a>
          </div>
        </div>
      </div>

      {/* What you get */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">What You Get</h2>
        <div className="bg-gray-800/30 rounded-xl p-8 font-mono text-sm">
          <pre className="text-gray-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                    YOUR VPS (~$4/month)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tailscale ─────────────── Access from anywhere (phone/laptop)  │
│                                                                 │
│  tmux ─────────────────── Persistent sessions                   │
│                                                                 │
│  Claude Code ──────────── AI coding assistant                   │
│                                                                 │
│  Gas Town (gt/bd) ─────── Agent orchestration                   │
│      ├── Polecats ─────── Ephemeral workers                     │
│      ├── Witness ──────── Monitors agents                       │
│      └── Refinery ─────── Merges code                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Deploy?</h2>
        <p className="text-gray-400 mb-6">
          Get your always-on AI agent environment in under 10 minutes.
        </p>
        <Link
          href="/wizard/"
          className="inline-block bg-gas-500 hover:bg-gas-600 text-black font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Start the Wizard →
        </Link>
      </div>
    </div>
  )
}
