import type { Wish } from '../types'

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

export function buildShareUrl(name: string, wishes: Wish[]): string {
  const base = window.location.origin + window.location.pathname
  const params = new URLSearchParams({ for: name, w: encodeWishes(wishes) })
  return `${base}?${params.toString()}`
}

export function parseShareUrl(): { name: string; wishes: Wish[] } | null {
  const params = new URLSearchParams(window.location.search)
  const name = params.get('for')
  const w = params.get('w')
  if (!name || !w) return null
  const wishes = decodeWishes(w)
  if (!wishes) return null
  return { name, wishes }
}
