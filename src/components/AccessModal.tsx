import { useState, type FormEvent } from 'react'
import { hashPassword } from '../lib/crypto'
import type { Session } from '../types'

interface AccessModalProps {
  session: Session
  onOwner: () => void
  onFriend: () => void
}

type Step = 'choose' | 'password'

export default function AccessModal({ session, onOwner, onFriend }: AccessModalProps) {
  const [step, setStep] = useState<Step>('choose')
  const [word, setWord] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const displayName = session.name.charAt(0).toUpperCase() + session.name.slice(1)

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = word.trim()
    if (!trimmed) return
    setLoading(true)
    const hash = await hashPassword(trimmed)
    setLoading(false)
    if (hash === session.passwordHash) {
      onOwner()
    } else {
      setError('Not quite — but you can still see the wishes as a friend.')
    }
  }

  if (step === 'choose') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up">
          <div className="bg-gradient-to-r from-sky-400 to-purple-500 px-6 py-5 text-center">
            <span className="text-4xl">🎂</span>
            <p className="mt-2 text-white font-semibold text-base">
              {displayName}'s birthday
            </p>
          </div>

          <div className="px-6 py-5 space-y-3">
            <p className="text-center text-gray-500 text-sm">
              Are you {displayName}?
            </p>

            <button
              onClick={() => setStep('password')}
              className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-medium hover:bg-purple-700 active:scale-95 transition-all shadow-md shadow-purple-200"
            >
              Yes, I'm {displayName}! 🎉
            </button>

            <button
              onClick={onFriend}
              className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 active:scale-95 transition-all"
            >
              I'm here as a friend 💌
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up">
        <div className="bg-gradient-to-r from-sky-400 to-purple-500 px-6 py-5 text-center">
          <span className="text-4xl">🔑</span>
          <p className="mt-2 text-white font-semibold text-base">
            What's the birthday password?
          </p>
        </div>

        <div className="px-6 py-5">
          <p className="text-center text-gray-500 text-sm mb-5">
            One joyful word only {displayName} would know
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              autoFocus
              type="text"
              value={word}
              onChange={e => { setWord(e.target.value.replace(/\s+/g, '')); setError('') }}
              placeholder="your secret word…"
              maxLength={30}
              className="w-full bg-fuchsia-50 border border-fuchsia-200 rounded-2xl px-4 py-3 text-center text-lg text-purple-900 placeholder:text-purple-300 placeholder:text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all tracking-wide"
            />

            {error && (
              <p className="text-center text-sm text-rose-500">{error}</p>
            )}

            {error ? (
              <button
                type="button"
                onClick={onFriend}
                className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 active:scale-95 transition-all"
              >
                continue as friend →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!word.trim() || loading}
                className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-medium hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-purple-200"
              >
                {loading ? '✨ checking…' : 'enter →'}
              </button>
            )}
          </form>

          <button
            onClick={() => { setStep('choose'); setWord(''); setError('') }}
            className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← back
          </button>
        </div>
      </div>
    </div>
  )
}
