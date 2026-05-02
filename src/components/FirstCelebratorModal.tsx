import { useState, type FormEvent } from 'react'
import { hashPassword } from '../lib/crypto'

interface FirstCelebratorModalProps {
  name: string
  onCreate: (passwordHash: string) => void
  onBack: () => void
}

export default function FirstCelebratorModal({ name, onCreate, onBack }: FirstCelebratorModalProps) {
  const [word, setWord] = useState('')
  const [loading, setLoading] = useState(false)
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = word.trim()
    if (!trimmed || trimmed.includes(' ')) return
    setLoading(true)
    const hash = await hashPassword(trimmed)
    setLoading(false)
    onCreate(hash)
  }

  const singleWord = word.trim().length > 0 && !word.trim().includes(' ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up">
        {/* Top accent */}
        <div className="bg-gradient-to-r from-fuchsia-400 to-purple-500 px-6 py-5 text-center">
          <span className="text-4xl">🎈</span>
          <p className="mt-2 text-white font-semibold text-base leading-snug">
            You're the first to celebrate {displayName}!
          </p>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-500 text-sm leading-relaxed text-center">
            No wishes set yet. If you're {displayName}, pick a{' '}
            <span className="text-purple-600 font-medium">birthday password</span> — one joyful
            natural word only you'd choose. Friends who don't know it can still see your wishes.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <input
                autoFocus
                type="text"
                value={word}
                onChange={e => setWord(e.target.value.replace(/\s+/g, ''))}
                placeholder="sunshine · rainbow · blossom"
                maxLength={30}
                className="w-full bg-fuchsia-50 border border-fuchsia-200 rounded-2xl px-4 py-3 text-center text-lg text-purple-900 placeholder:text-purple-300 placeholder:text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all tracking-wide"
              />
              <p className="mt-1.5 text-center text-xs text-gray-400">
                one word · no spaces · you'll use this to edit later
              </p>
            </div>

            <button
              type="submit"
              disabled={!singleWord || loading}
              className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-medium tracking-wide hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-purple-200"
            >
              {loading ? '✨ setting up…' : 'start celebrating →'}
            </button>
          </form>

          <button
            onClick={onBack}
            className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            I'm just a friend — go back
          </button>
        </div>
      </div>
    </div>
  )
}
