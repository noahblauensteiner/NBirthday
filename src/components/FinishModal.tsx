import { useState, useEffect, type FormEvent } from 'react'
import type { Wish } from '../types'

interface FinishModalProps {
  wish: Wish
  onFinish: (name: string) => void
  onClose: () => void
}

export default function FinishModal({ wish, onFinish, onClose }: FinishModalProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onFinish(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="text-3xl mb-2">🛍️</div>
          <h2 className="text-lg font-semibold text-gray-800">Mark as bought</h2>
          <p className="text-sm text-gray-500 mt-1">
            "{wish.title}" will show as bought to other visitors — but not to the birthday person.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name *"
            maxLength={60}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-emerald-100"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
