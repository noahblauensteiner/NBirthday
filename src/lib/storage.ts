import type { ChipIn } from '../types'

export function getOwnerToken(pageId: string): string | null {
  return localStorage.getItem(`nbd:token:${pageId}`)
}

export function saveOwnerToken(pageId: string, hash: string): void {
  localStorage.setItem(`nbd:token:${pageId}`, hash)
}

export function getCoordToken(pageId: string): string | null {
  return localStorage.getItem(`nbd:coord:${pageId}`)
}

export function saveCoordToken(pageId: string, token: string): void {
  localStorage.setItem(`nbd:coord:${pageId}`, token)
}

const chipInsKey = (wishId: string) => `nbd:chipins:${wishId}`

export function loadChipIns(wishId: string): ChipIn[] {
  try {
    const raw = localStorage.getItem(chipInsKey(wishId))
    return raw ? (JSON.parse(raw) as ChipIn[]) : []
  } catch {
    return []
  }
}

export function addChipIn(wishId: string, chipIn: ChipIn): ChipIn[] {
  const existing = loadChipIns(wishId)
  const updated = [...existing, chipIn]
  localStorage.setItem(chipInsKey(wishId), JSON.stringify(updated))
  return updated
}
