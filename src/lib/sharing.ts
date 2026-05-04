import type { Wish } from '../types'

// Legacy encode/decode kept for backward-compat with old ?for=&w= links
export function encodeWishes(wishes: Wish[]): string {
  return btoa(encodeURIComponent(JSON.stringify(wishes)))
}

export function decodeWishes(encoded: string): Wish[] | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as Wish[]
  } catch {
    return null
  }
}

export function buildShareUrl(pageId: string): string {
  return `${window.location.origin}${window.location.pathname}?p=${pageId}`
}

export type ParsedUrl =
  | { type: 'pageId'; pageId: string }
  | { type: 'legacy'; name: string; wishes: Wish[] }
  | null

export function parseUrl(): ParsedUrl {
  const params = new URLSearchParams(window.location.search)

  const p = params.get('p')
  if (p) return { type: 'pageId', pageId: p }

  const name = params.get('for')
  const w = params.get('w')
  if (name && w) {
    const wishes = decodeWishes(w)
    if (wishes) return { type: 'legacy', name, wishes }
  }

  return null
}
