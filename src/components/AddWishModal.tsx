import { useState, useEffect, type FormEvent } from 'react'
import type { Wish, WishType } from '../types'

const TYPES: { type: WishType; emoji: string; label: string; picturePlaceholder: string }[] = [
  { type: 'gift',     emoji: '🎁', label: 'Gift',     picturePlaceholder: 'airpods, flowers, book…' },
  { type: 'activity', emoji: '🏃', label: 'Activity', picturePlaceholder: 'hiking, concert, cooking…' },
  { type: 'party',    emoji: '🎉', label: 'Party',    picturePlaceholder: 'rooftop, garden, beach…' },
  { type: 'dinner',   emoji: '🍽️', label: 'Dinner',   picturePlaceholder: 'sushi, italian, barbecue…' },
]

interface AddWishModalProps {
  initial?: Wish
  onSave: (wish: Omit<Wish, 'id'>) => void
  onClose: () => void
}

export default function AddWishModal({ initial, onSave, onClose }: AddWishModalProps) {
  const [type, setType] = useState<WishType>(initial?.type ?? 'gift')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [picture, setPicture] = useState(initial?.picture ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onSave({
      type,
      title: trimmed,
      picture: picture.trim() || undefined,
      note: note.trim() || undefined,
      url: url.trim() || undefined,
    })
  }

  const currentType = TYPES.find(t => t.type === type)!

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initial ? 'Edit wish' : 'Add a wish'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button
                key={t.type}
                type="button"
                onClick={() => setType(t.type)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all text-sm font-medium ${
                  type === t.type
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What do you want? *"
            maxLength={80}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
          />

          {/* Picture keyword */}
          <div className="relative">
            <input
              type="text"
              value={picture}
              onChange={e => setPicture(e.target.value)}
              placeholder={currentType.picturePlaceholder}
              maxLength={40}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-gray-800 placeholder:text-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
              🖼️
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 pointer-events-none">
              cover image
            </span>
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any details? (optional)"
            maxLength={200}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none resize-none"
          />

          {/* URL */}
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Link (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
          />

          {/* Actions */}
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
              disabled={!title.trim()}
              className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-purple-200"
            >
              {initial ? 'Save' : 'Add wish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
