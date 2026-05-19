import { useState } from 'react'
import type { Session, Wish } from '../types'
import WishCard from '../components/WishCard'
import AddWishModal from '../components/AddWishModal'
import { buildShareUrl } from '../lib/sharing'
import { fetchWishImage } from '../lib/images'

interface WishListProps {
  session: Session
  canEdit: boolean
  onUpdate: (session: Session) => void
  onBack: () => void
  isDark: boolean
  onToggleDark: () => void
}

export default function WishList({ session, canEdit, onUpdate, onBack, isDark, onToggleDark }: WishListProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingWish, setEditingWish] = useState<Wish | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleAdd(data: Omit<Wish, 'id'>) {
    const id = crypto.randomUUID()
    const imageUrl = data.picture ? await fetchWishImage(data.picture, id) : undefined
    const wish: Wish = { ...data, id, imageUrl }
    onUpdate({ ...session, wishes: [...session.wishes, wish] })
    setShowModal(false)
  }

  async function handleEdit(data: Omit<Wish, 'id'>) {
    if (!editingWish) return
    const pictureChanged = data.picture !== editingWish.picture
    const imageUrl = data.picture
      ? pictureChanged
        ? await fetchWishImage(data.picture, editingWish.id)
        : editingWish.imageUrl
      : undefined
    onUpdate({
      ...session,
      wishes: session.wishes.map(w =>
        w.id === editingWish.id ? { ...data, id: w.id, imageUrl } : w,
      ),
    })
    setEditingWish(null)
  }

  function handleDelete(id: string) {
    onUpdate({ ...session, wishes: session.wishes.filter(w => w.id !== id) })
  }

  async function handleShare() {
    const url = buildShareUrl(session.name, session.wishes)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      prompt('Copy this link to share:', url)
    }
  }

  const displayName = session.name.charAt(0).toUpperCase() + session.name.slice(1)

  return (
    <div className="min-h-dvh bg-gradient-to-br from-rose-50 via-fuchsia-50 to-sky-100 dark:from-slate-950 dark:via-purple-950/60 dark:to-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/60 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium"
          >
            ← back
          </button>

          <h1 className="font-semibold text-gray-800 dark:text-gray-100 text-base truncate max-w-[160px]">
            {displayName}'s wishes 🎂
          </h1>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleDark}
              aria-label="Toggle dark mode"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-base bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {canEdit ? (
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:scale-95 transition-all shadow-sm shadow-purple-200 dark:shadow-purple-950"
              >
                {copied ? '✓ copied!' : 'share'}
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-3 py-5 pb-28">
        {session.wishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <span className="text-5xl mb-4">🎈</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {canEdit ? 'Add your first wish below' : 'No wishes added yet'}
            </p>
            {!canEdit && (
              <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">
                Check back after {displayName} sets up their list
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {session.wishes.map(wish => (
              <WishCard
                key={wish.id}
                wish={wish}
                canEdit={canEdit}
                onEdit={() => setEditingWish(wish)}
                onDelete={() => handleDelete(wish.id)}
              />
            ))}
          </div>
        )}

        {!canEdit && session.wishes.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
            You're viewing {displayName}'s wishes · tap a link to explore
          </p>
        )}
      </main>

      {/* FAB — add wish */}
      {canEdit && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 text-white font-medium shadow-xl shadow-purple-300/50 dark:shadow-purple-950/60 hover:bg-purple-700 active:scale-95 transition-all"
          >
            <span className="text-lg leading-none">+</span>
            <span>add a wish</span>
          </button>
        </div>
      )}

      {showModal && (
        <AddWishModal onSave={handleAdd} onClose={() => setShowModal(false)} />
      )}

      {editingWish && (
        <AddWishModal
          initial={editingWish}
          onSave={handleEdit}
          onClose={() => setEditingWish(null)}
        />
      )}
    </div>
  )
}
