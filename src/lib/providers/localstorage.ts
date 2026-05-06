import { nanoid } from 'nanoid'
import type { DataProvider, PageResult } from './types'
import { ProviderError } from './types'
import type { Page, Wish, Finish, EventLog } from '../../types'

interface LSPage {
  id: string
  personName: string
  passwordHash: string
  coordToken: string
  wishes: Wish[]
  eventDate?: string
  createdAt: string
  updatedAt: string
}

const K = {
  page: (id: string) => `nbd:ls:page:${id}`,
  names: (norm: string) => `nbd:ls:names:${norm}`,
  finishes: (pageId: string) => `nbd:ls:finishes:${pageId}`,
  events: (pageId: string) => `nbd:ls:events:${pageId}`,
}

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function toPublic(p: LSPage): Page {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, coordToken: _ct, ...rest } = p
  return rest
}

export class LocalStorageProvider implements DataProvider {
  searchPages(name: string): Promise<PageResult[]> {
    const norm = name.toLowerCase().trim()
    const ids = getJSON<string[]>(K.names(norm), [])
    const results = ids
      .map(id => getJSON<LSPage | null>(K.page(id), null))
      .filter((p): p is LSPage => p !== null)
      .map(p => ({ id: p.id, personName: p.personName, createdAt: p.createdAt }))
    return Promise.resolve(results)
  }

  getPage(pageId: string): Promise<Page> {
    const p = getJSON<LSPage | null>(K.page(pageId), null)
    if (!p) return Promise.reject(new ProviderError(404, 'Not found'))
    return Promise.resolve(toPublic(p))
  }

  createPage(
    personName: string,
    passwordHash: string,
    wishes: Wish[] = [],
  ): Promise<{ id: string; coordToken: string }> {
    const id = nanoid(10)
    const coordToken = nanoid(8)
    const now = new Date().toISOString()
    const page: LSPage = { id, personName, passwordHash, coordToken, wishes, createdAt: now, updatedAt: now }
    setJSON(K.page(id), page)
    const norm = personName.toLowerCase().trim()
    setJSON(K.names(norm), [...getJSON<string[]>(K.names(norm), []), id])
    return Promise.resolve({ id, coordToken })
  }

  updatePage(
    pageId: string,
    passwordHash: string,
    patch: { wishes?: Wish[]; personName?: string },
  ): Promise<Page> {
    const p = getJSON<LSPage | null>(K.page(pageId), null)
    if (!p) return Promise.reject(new ProviderError(404, 'Not found'))
    if (p.passwordHash !== passwordHash) return Promise.reject(new ProviderError(403, 'Forbidden'))

    if (patch.personName && patch.personName !== p.personName) {
      const oldNorm = p.personName.toLowerCase().trim()
      setJSON(K.names(oldNorm), getJSON<string[]>(K.names(oldNorm), []).filter(id => id !== pageId))
      const newNorm = patch.personName.toLowerCase().trim()
      setJSON(K.names(newNorm), [...getJSON<string[]>(K.names(newNorm), []), pageId])
    }

    const updated: LSPage = {
      ...p,
      ...(patch.wishes !== undefined ? { wishes: patch.wishes } : {}),
      ...(patch.personName !== undefined ? { personName: patch.personName } : {}),
      updatedAt: new Date().toISOString(),
    }
    setJSON(K.page(pageId), updated)
    return Promise.resolve(toPublic(updated))
  }

  verifyPassword(pageId: string, passwordHash: string): Promise<{ valid: boolean }> {
    const p = getJSON<LSPage | null>(K.page(pageId), null)
    if (!p) return Promise.reject(new ProviderError(404, 'Not found'))
    return Promise.resolve({ valid: p.passwordHash === passwordHash })
  }

  getFinishes(pageId: string): Promise<Finish[]> {
    return Promise.resolve(getJSON<Finish[]>(K.finishes(pageId), []))
  }

  createFinish(pageId: string, wishId: string, finishedBy: string): Promise<Finish> {
    const p = getJSON<LSPage | null>(K.page(pageId), null)
    if (!p) return Promise.reject(new ProviderError(404, 'Not found'))
    if (!p.wishes.some(w => w.id === wishId)) return Promise.reject(new ProviderError(400, 'Wish not found'))

    const finishes = getJSON<Finish[]>(K.finishes(pageId), [])
    if (finishes.some(f => f.wishId === wishId)) return Promise.reject(new ProviderError(409, 'Already finished'))

    const finish: Finish = { id: nanoid(8), wishId, finishedBy, finishedAt: new Date().toISOString() }
    setJSON(K.finishes(pageId), [...finishes, finish])

    // Also write event (fire-and-forget — LS is sync so this is fine)
    this.createEvent(pageId, { type: 'finish', wishId, actorName: finishedBy }).catch(() => {})

    return Promise.resolve(finish)
  }

  deleteFinish(pageId: string, finishId: string): Promise<void> {
    const finishes = getJSON<Finish[]>(K.finishes(pageId), [])
    const filtered = finishes.filter(f => f.id !== finishId)
    if (filtered.length === finishes.length) return Promise.reject(new ProviderError(404, 'Not found'))
    setJSON(K.finishes(pageId), filtered)
    return Promise.resolve()
  }

  getEvents(pageId: string, token: string): Promise<EventLog[]> {
    const p = getJSON<LSPage | null>(K.page(pageId), null)
    if (!p) return Promise.reject(new ProviderError(404, 'Not found'))
    if (token !== p.passwordHash && token !== p.coordToken) {
      return Promise.reject(new ProviderError(403, 'Forbidden'))
    }
    return Promise.resolve([...getJSON<EventLog[]>(K.events(pageId), [])].reverse())
  }

  createEvent(
    pageId: string,
    event: { type: 'finish' | 'chipin'; wishId: string; actorName: string; amount?: number },
  ): Promise<EventLog> {
    const entry: EventLog = { id: nanoid(8), ...event, createdAt: new Date().toISOString() }
    const events = getJSON<EventLog[]>(K.events(pageId), [])
    setJSON(K.events(pageId), [...events, entry])
    return Promise.resolve(entry)
  }
}
