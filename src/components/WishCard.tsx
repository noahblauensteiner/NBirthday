import { useState } from 'react'
import type { Wish, WishType } from '../types'

const TYPE_META: Record<WishType, {
  emoji: string
  label: string
  badge: string
  fallbackBg: string
}> = {
  gift:     { emoji: '🎁', label: 'Gift',     badge: 'bg-rose-50 text-rose-500',    fallbackBg: 'from-rose-100 to-pink-200' },
  activity: { emoji: '🏃', label: 'Activity', badge: 'bg-emerald-50 text-emerald-600', fallbackBg: 'from-emerald-100 to-teal-200' },
  party:    { emoji: '🎉', label: 'Party',    badge: 'bg-violet-50 text-violet-600', fallbackBg: 'from-violet-100 to-purple-200' },
  dinner:   { emoji: '🍽️', label: 'Dinner',   badge: 'bg-orange-50 text-orange-500', fallbackBg: 'from-orange-100 to-amber-200' },
}

interface WishCardProps {
  wish: Wish
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function WishCard({ wish, canEdit, onEdit, onDelete }: WishCardProps) {
  const meta = TYPE_META[wish.type]
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = !!wish.imageUrl && !imgFailed

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Cover image / gradient */}
      <div className="aspect-square relative overflow-hidden flex-shrink-0">
        {showImage ? (
          <img
            src={wish.imageUrl}
            alt={wish.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${meta.fallbackBg} flex items-center justify-center`}>
            <span className="text-5xl">{meta.emoji}</span>
          </div>
        )}

        {/* Edit / delete overlay — top-right on hover */}
        {canEdit && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm text-sm shadow flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Edit"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm text-sm shadow flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex flex-col gap-1">
        <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}>
          {meta.emoji} {meta.label}
        </span>
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {wish.title}
        </p>
        {wish.url && (
          <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-600 transition-colors truncate"
          >
            🔗 link
          </a>
        )}
      </div>
    </div>
  )
}
