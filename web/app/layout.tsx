import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gas Town Remote - Deploy AI Agents to the Cloud',
  description: 'One-click deployment of Gas Town (AI agent orchestration) to your own VPS. Access from anywhere via Tailscale.',
  keywords: ['gas town', 'ai agents', 'claude code', 'vps', 'tailscale', 'hetzner'],
  openGraph: {
    title: 'Gas Town Remote',
    description: 'Deploy AI agents to the cloud in minutes',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <nav className="border-b border-gray-800">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">⛽</span>
              <span>Gas Town Remote</span>
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/wizard/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Deploy
              </a>
              <a
                href="https://github.com/xxx/gastown-remote"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-800 mt-20">
          <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
            <p>Open source. Free forever. Your tokens never leave your device.</p>
            <p className="mt-2">
              <a href="https://github.com/xxx/gastown-remote" className="underline hover:text-gray-300">
                View on GitHub
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
