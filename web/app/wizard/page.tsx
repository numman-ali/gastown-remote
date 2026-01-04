'use client'

import { useState, useCallback } from 'react'
import { generateCloudInit, validateServerName, validateTailscaleKey } from '@/lib/generate-config'

type Step = 'input' | 'config' | 'guide'

export default function WizardPage() {
  const [step, setStep] = useState<Step>('input')
  const [serverName, setServerName] = useState('gastown')
  const [tailscaleKey, setTailscaleKey] = useState('')
  const [errors, setErrors] = useState<{ serverName?: string; tailscaleKey?: string }>({})
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState('')

  const handleGenerate = useCallback(() => {
    const serverNameError = validateServerName(serverName)
    const tailscaleKeyError = validateTailscaleKey(tailscaleKey)

    if (serverNameError || tailscaleKeyError) {
      setErrors({
        serverName: serverNameError || undefined,
        tailscaleKey: tailscaleKeyError || undefined,
      })
      return
    }

    setErrors({})
    const generatedConfig = generateCloudInit({ serverName, tailscaleKey })
    setConfig(generatedConfig)
    setStep('config')
  }, [serverName, tailscaleKey])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(config)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = config
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [config])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-12">
        <div className={`w-3 h-3 rounded-full ${step === 'input' ? 'bg-gas-500' : 'bg-gray-600'}`} />
        <div className={`w-12 h-0.5 ${step !== 'input' ? 'bg-gas-500' : 'bg-gray-600'}`} />
        <div className={`w-3 h-3 rounded-full ${step === 'config' ? 'bg-gas-500' : step === 'guide' ? 'bg-gas-500' : 'bg-gray-600'}`} />
        <div className={`w-12 h-0.5 ${step === 'guide' ? 'bg-gas-500' : 'bg-gray-600'}`} />
        <div className={`w-3 h-3 rounded-full ${step === 'guide' ? 'bg-gas-500' : 'bg-gray-600'}`} />
      </div>

      {step === 'input' && (
        <div>
          <h1 className="text-3xl font-bold mb-2 text-center">Generate Your Config</h1>
          <p className="text-gray-400 mb-8 text-center">
            Enter your details. We'll generate a cloud-init config you can paste into Hetzner.
          </p>

          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Server Name
                <span className="text-gray-500 font-normal ml-2">(will be your Tailscale hostname)</span>
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value.toLowerCase())}
                placeholder="gastown"
                className={`w-full bg-gray-900 border ${errors.serverName ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:outline-none focus:border-gas-500 transition-colors`}
              />
              {errors.serverName && (
                <p className="text-red-400 text-sm mt-1">{errors.serverName}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Tailscale Auth Key
              </label>
              <input
                type="password"
                value={tailscaleKey}
                onChange={(e) => setTailscaleKey(e.target.value)}
                placeholder="tskey-auth-xxxxxxxxxxxx"
                className={`w-full bg-gray-900 border ${errors.tailscaleKey ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:outline-none focus:border-gas-500 transition-colors font-mono`}
              />
              {errors.tailscaleKey && (
                <p className="text-red-400 text-sm mt-1">{errors.tailscaleKey}</p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                Get one at{' '}
                <a
                  href="https://login.tailscale.com/admin/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gas-400 underline"
                >
                  tailscale.com/admin/settings/keys
                </a>
                {' '}→ Generate auth key → Reusable ✓
              </p>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-gas-500 hover:bg-gas-600 text-black font-semibold py-4 rounded-lg transition-colors touch-target"
            >
              Generate Config →
            </button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm">
            <p className="text-blue-300">
              <strong>🔒 Privacy:</strong> Your Tailscale key is embedded in the config but never sent to our servers.
              Everything happens in your browser.
            </p>
          </div>
        </div>
      )}

      {step === 'config' && (
        <div>
          <h1 className="text-3xl font-bold mb-2 text-center">Your Config is Ready</h1>
          <p className="text-gray-400 mb-8 text-center">
            Copy this and paste it into Hetzner when creating your server.
          </p>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">cloud-init.yml</span>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-80 overflow-y-auto">
              {config}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('input')}
              className="flex-1 border border-gray-600 hover:border-gray-400 py-4 rounded-lg transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep('guide')}
              className="flex-1 bg-gas-500 hover:bg-gas-600 text-black font-semibold py-4 rounded-lg transition-colors"
            >
              Next: Create Server →
            </button>
          </div>
        </div>
      )}

      {step === 'guide' && (
        <div>
          <h1 className="text-3xl font-bold mb-2 text-center">Create Your Server</h1>
          <p className="text-gray-400 mb-8 text-center">
            Follow these steps in the Hetzner console.
          </p>

          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gas-500 text-black rounded-full flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Open Hetzner Console</h3>
                  <p className="text-gray-400 mb-3">
                    Go to your project and click "Add Server"
                  </p>
                  <a
                    href="https://console.hetzner.cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Open Hetzner Console →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gas-500 text-black rounded-full flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Configure Server</h3>
                  <ul className="text-gray-400 space-y-2">
                    <li>• <strong>Location:</strong> Any (Nuremberg is closest to EU)</li>
                    <li>• <strong>Image:</strong> Ubuntu 24.04</li>
                    <li>• <strong>Type:</strong> CX22 (~$4/mo) or CX32 (~$8/mo)</li>
                    <li>• <strong>SSH Key:</strong> Optional (Tailscale SSH is primary)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gas-500 text-black rounded-full flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Paste Cloud Config</h3>
                  <p className="text-gray-400 mb-3">
                    Scroll down to "Cloud config" and paste the config you copied earlier.
                  </p>
                  <button
                    onClick={() => setStep('config')}
                    className="text-gas-400 underline text-sm"
                  >
                    ← Go back to copy config
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gas-500 text-black rounded-full flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Create & Wait</h3>
                  <p className="text-gray-400">
                    Click "Create & Buy now". Your server will be ready in ~3-5 minutes.
                    Check your Tailscale app for "<strong>{serverName}</strong>" to appear.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gas-500 text-black rounded-full flex items-center justify-center font-bold shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Connect!</h3>
                  <p className="text-gray-400 mb-3">
                    Once "{serverName}" appears in Tailscale, connect via SSH:
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                    ssh gastown@{serverName}
                  </div>
                  <p className="text-gray-500 text-sm mt-3">
                    First time: run <code className="bg-gray-700 px-1 rounded">claude</code> → <code className="bg-gray-700 px-1 rounded">/login</code> to authenticate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setStep('config')}
              className="flex-1 border border-gray-600 hover:border-gray-400 py-4 rounded-lg transition-colors"
            >
              ← Back to Config
            </button>
            <a
              href="/"
              className="flex-1 bg-gas-500 hover:bg-gas-600 text-black font-semibold py-4 rounded-lg transition-colors text-center"
            >
              Done!
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
