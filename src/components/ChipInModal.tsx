import { useState, type FormEvent } from 'react'
import type { Wish, ChipIn } from '../types'

interface ChipInModalProps {
  wish: Wish
  totalPledged: number
  onChipIn: (chipIn: ChipIn) => void
  onClose: () => void
}

export default function ChipInModal({ wish, totalPledged, onChipIn, onClose }: ChipInModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const remaining = Math.max(0, (wish.price ?? 0) - totalPledged)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nameT = name.trim()
    const amt = parseFloat(amount)
    if (!nameT || !amt || amt <= 0) return
    onChipIn({ name: nameT, amount: amt, createdAt: new Date().toISOString() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-800">Chip in 🤝</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">{wish.title}</p>
          {remaining > 0 && (
            <p className="text-xs text-purple-400 mt-0.5">
              €{remaining % 1 === 0 ? remaining : remaining.toFixed(2)} still needed
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
          />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
              €
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="How much?"
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-gray-800 placeholder:text-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-purple-200"
            >
              Chip in ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
