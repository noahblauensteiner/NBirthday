import type { Session, ChipIn } from '../types'

const sessionKey = (name: string) => `nbd:session:${name.toLowerCase().trim()}`
const tokenKey = (name: string) => `nbd:token:${name.toLowerCase().trim()}`

export function loadSession(name: string): Session | null {
  try {
    const raw = localStorage.getItem(sessionKey(name))
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(sessionKey(session.name), JSON.stringify(session))
}

export function getEditToken(name: string): string | null {
  return localStorage.getItem(tokenKey(name))
}

export function saveEditToken(name: string, token: string): void {
  localStorage.setItem(tokenKey(name), token)
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
