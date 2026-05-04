import { useState } from 'react'
import type { Page, ViewMode, Wish } from '../types'
import WishCard from '../components/WishCard'
import AddWishModal from '../components/AddWishModal'
import { buildShareUrl } from '../lib/sharing'

interface WishListProps {
  page: Page
  viewMode: ViewMode
  onUpdate: (wishes: Wish[]) => void
  onBack: () => void
}

export default function WishList({ page, viewMode, onUpdate, onBack }: WishListProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingWish, setEditingWish] = useState<Wish | null>(null)
  const [copied, setCopied] = useState(false)

  const canEdit = viewMode === 'owner'

  function handleAdd(data: Omit<Wish, 'id'>) {
    const wish: Wish = { ...data, id: crypto.randomUUID() }
    onUpdate([...page.wishes, wish])
    setShowModal(false)
  }

  function handleEdit(data: Omit<Wish, 'id'>) {
    if (!editingWish) return
    onUpdate(
      page.wishes.map(w => (w.id === editingWish.id ? { ...data, id: w.id } : w)),
    )
    setEditingWish(null)
  }

  function handleDelete(id: string) {
    onUpdate(page.wishes.filter(w => w.id !== id))
  }

  async function handleShare() {
    const url = buildShareUrl(page.id)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      prompt('Copy this link to share:', url)
    }
  }

  const displayName = page.personName.charAt(0).toUpperCase() + page.personName.slice(1)

  return (
    <div className="min-h-dvh bg-gradient-to-br from-rose-50 via-fuchsia-50 to-sky-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors text-sm font-medium"
          >
            ← back
          </button>

          <h1 className="font-semibold text-gray-800 text-base truncate max-w-[180px]">
            {displayName}'s wishes 🎂
          </h1>

          {canEdit ? (
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:scale-95 transition-all shadow-sm shadow-purple-200"
            >
              {copied ? '✓ copied!' : 'share'}
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-3 py-5 pb-28">
        {page.wishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <span className="text-5xl mb-4">🎈</span>
            <p className="text-gray-500 font-medium">
              {canEdit ? 'Add your first wish below' : 'No wishes added yet'}
            </p>
            {!canEdit && (
              <p className="text-gray-400 text-sm mt-1">
                Check back after {displayName} sets up their list
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {page.wishes.map(wish => (
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

        {!canEdit && page.wishes.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-400">
            You're viewing {displayName}'s wishes · tap a link to explore
          </p>
        )}
      </main>

      {/* FAB — add wish */}
      {canEdit && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 text-white font-medium shadow-xl shadow-purple-300/50 hover:bg-purple-700 active:scale-95 transition-all"
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
