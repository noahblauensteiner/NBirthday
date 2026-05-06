import { useState, useEffect } from 'react'
import type { EventLog, Wish } from '../types'
import { provider } from '../lib/providers'

interface EventLogPanelProps {
  pageId: string
  token: string
  wishes: Wish[]
  onClose: () => void
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const EVENT_META: Record<string, { icon: string; label: (e: EventLog) => string }> = {
  finish: {
    icon: '🛍️',
    label: e => `${e.actorName} bought this`,
  },
  chipin: {
    icon: '💰',
    label: e => `${e.actorName} chipped in${e.amount != null ? ` €${e.amount % 1 === 0 ? e.amount : e.amount.toFixed(2)}` : ''}`,
  },
}

export default function EventLogPanel({ pageId, token, wishes, onClose }: EventLogPanelProps) {
  const [events, setEvents] = useState<EventLog[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    provider.getEvents(pageId, token)
      .then(setEvents)
      .catch(() => setError('Could not load activity log.'))
  }, [pageId, token])

  const wishMap = Object.fromEntries(wishes.map(w => [w.id, w.title]))

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Activity log</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 flex-1">
          {error && (
            <p className="text-sm text-red-500 text-center py-8">{error}</p>
          )}

          {!error && events === null && (
            <p className="text-sm text-gray-400 text-center py-8 animate-pulse">Loading…</p>
          )}

          {events !== null && events.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No activity yet.</p>
          )}

          {events !== null && events.length > 0 && (
            <ul className="space-y-3">
              {events.map(e => {
                const meta = EVENT_META[e.type]
                return (
                  <li key={e.id} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{meta?.icon ?? '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium leading-snug">
                        {meta?.label(e) ?? e.type}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {wishMap[e.wishId] ?? 'Unknown wish'} · {fmtTime(e.createdAt)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
