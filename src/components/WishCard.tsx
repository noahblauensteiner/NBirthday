import type { Wish, WishType } from '../types'

const TYPE_META: Record<WishType, { emoji: string; label: string; color: string; border: string; badge: string }> = {
  gift:     { emoji: '🎁', label: 'Gift',     color: 'text-rose-600',   border: 'border-rose-300',   badge: 'bg-rose-50 text-rose-500' },
  activity: { emoji: '🏃', label: 'Activity', color: 'text-emerald-600', border: 'border-emerald-300', badge: 'bg-emerald-50 text-emerald-600' },
  party:    { emoji: '🎉', label: 'Party',    color: 'text-violet-600',  border: 'border-violet-300',  badge: 'bg-violet-50 text-violet-600' },
  dinner:   { emoji: '🍽️', label: 'Dinner',   color: 'text-orange-600',  border: 'border-orange-300',  badge: 'bg-orange-50 text-orange-500' },
}

interface WishCardProps {
  wish: Wish
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function WishCard({ wish, canEdit, onEdit, onDelete }: WishCardProps) {
  const meta = TYPE_META[wish.type]

  return (
    <div className={`group bg-white rounded-2xl p-4 shadow-sm border-l-4 ${meta.border} flex items-start gap-3`}>
      <span className="text-2xl leading-none mt-0.5 flex-shrink-0">{meta.emoji}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}>
            {meta.label}
          </span>
        </div>
        <p className="mt-1 font-semibold text-gray-800 leading-snug">{wish.title}</p>
        {wish.note && (
          <p className="mt-0.5 text-sm text-gray-400 leading-snug">{wish.note}</p>
        )}
        {wish.url && (
          <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 transition-colors"
          >
            <span>🔗</span>
            <span className="underline underline-offset-2 truncate max-w-[200px]">{wish.url}</span>
          </a>
        )}
      </div>

      {canEdit && (
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors text-sm"
            aria-label="Edit wish"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
            aria-label="Delete wish"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}
