import { useState } from 'react'
import type { Wish, WishType, ChipIn, Finish } from '../types'
import { loadChipIns, addChipIn } from '../lib/storage'
import { provider } from '../lib/providers'
import ChipInModal from './ChipInModal'
import FinishModal from './FinishModal'

const TYPE_META: Record<WishType, {
  emoji: string
  label: string
  badge: string
  fallbackBg: string
}> = {
  gift:     { emoji: '🎁', label: 'Gift',     badge: 'bg-rose-50 text-rose-500',       fallbackBg: 'from-rose-100 to-pink-200' },
  activity: { emoji: '🏃', label: 'Activity', badge: 'bg-emerald-50 text-emerald-600', fallbackBg: 'from-emerald-100 to-teal-200' },
  party:    { emoji: '🎉', label: 'Party',    badge: 'bg-violet-50 text-violet-600',   fallbackBg: 'from-violet-100 to-purple-200' },
  dinner:   { emoji: '🍽️', label: 'Dinner',   badge: 'bg-orange-50 text-orange-500',  fallbackBg: 'from-orange-100 to-amber-200' },
}


function fmtPrice(n: number): string {
  return `€${n % 1 === 0 ? n : n.toFixed(2)}`
}

interface WishCardProps {
  wish: Wish
  pageId: string
  canEdit: boolean
  finish?: Finish
  onEdit: () => void
  onDelete: () => void
  onFinished: (finish: Finish) => void
}

export default function WishCard({ wish, pageId, canEdit, finish, onEdit, onDelete, onFinished }: WishCardProps) {
  const meta = TYPE_META[wish.type]
  const [imgFailed, setImgFailed] = useState(false)
  const [chipIns, setChipIns] = useState<ChipIn[]>(() =>
    wish.type === 'gift' && wish.price != null ? loadChipIns(wish.id) : []
  )
  const [showChipModal, setShowChipModal] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [finishing, setFinishing] = useState(false)

  const showImage = !!wish.picture && !imgFailed
  const isGiftWithPrice = wish.type === 'gift' && wish.price != null
  const totalPledged = chipIns.reduce((sum, c) => sum + c.amount, 0)
  const pct = isGiftWithPrice ? Math.min(100, (totalPledged / wish.price!) * 100) : 0
  const isFunded = isGiftWithPrice && totalPledged >= wish.price!
  const isBought = !!finish && !canEdit

  async function handleChipIn(chipIn: ChipIn) {
    const updated = addChipIn(wish.id, chipIn)
    setChipIns(updated)
    setShowChipModal(false)
    // Fire-and-forget event log
    provider.createEvent(pageId, { type: 'chipin', wishId: wish.id, actorName: chipIn.name, amount: chipIn.amount }).catch(() => {})
  }

  async function handleFinish(name: string) {
    setFinishing(true)
    try {
      const f = await provider.createFinish(pageId, wish.id, name)
      onFinished(f)
    } catch {
      // 409 means someone else already bought it — still close modal gracefully
    } finally {
      setFinishing(false)
      setShowFinishModal(false)
    }
  }

  return (
    <>
      <div className={`group relative bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col transition-opacity ${isBought ? 'opacity-60' : ''}`}>
        {/* Cover image / gradient */}
        <div className="aspect-square relative overflow-hidden flex-shrink-0">
          {showImage ? (
            <img
              src={wish.picture}
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

          {/* Bought overlay — visible to non-owners only */}
          {isBought && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">✅</span>
                <span className="text-xs font-semibold text-gray-600 bg-white/80 px-2 py-0.5 rounded-full">
                  bought
                </span>
              </div>
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

          {/* Price badge — bottom-left of image */}
          {isGiftWithPrice && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
              {fmtPrice(wish.price!)}
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

        {/* Fund section — gift with price only */}
        {isGiftWithPrice && !isBought && (
          <div className="px-3 pb-3 flex flex-col gap-1.5">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFunded ? 'bg-emerald-400' : 'bg-purple-400'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {isFunded ? (
              <p className="text-xs text-emerald-500 font-medium text-center py-0.5">
                🎉 Goal reached — time to organise!
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {fmtPrice(totalPledged)} / {fmtPrice(wish.price!)}
                </span>
                {!canEdit && (
                  <button
                    onClick={() => setShowChipModal(true)}
                    className="text-xs text-purple-500 font-medium hover:text-purple-700 transition-colors"
                  >
                    chip in →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mark as bought button — non-owners only, not yet bought */}
        {!canEdit && !isBought && (
          <div className="px-3 pb-3 mt-auto">
            <button
              onClick={() => setShowFinishModal(true)}
              disabled={finishing}
              className="w-full py-1.5 rounded-xl border border-emerald-200 text-emerald-600 text-xs font-medium hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              {finishing ? 'Saving…' : '🛍️ I bought this'}
            </button>
          </div>
        )}
      </div>

      {showChipModal && (
        <ChipInModal
          wish={wish}
          totalPledged={totalPledged}
          onChipIn={handleChipIn}
          onClose={() => setShowChipModal(false)}
        />
      )}

      {showFinishModal && (
        <FinishModal
          wish={wish}
          onFinish={handleFinish}
          onClose={() => setShowFinishModal(false)}
        />
      )}
    </>
  )
}
