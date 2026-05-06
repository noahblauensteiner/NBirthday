import type { Page, Claim, Wish, Finish, EventLog } from '../types'

const BASE = '/.netlify/functions'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function getPage(pageId: string): Promise<Page> {
  return req('GET', `/page?id=${encodeURIComponent(pageId)}`)
}

export function createPage(
  personName: string,
  passwordHash: string,
  wishes?: Wish[],
): Promise<{ id: string; coordToken: string }> {
  return req('POST', '/page', { personName, passwordHash, wishes })
}

export function updatePage(
  pageId: string,
  passwordHash: string,
  patch: { wishes?: Wish[]; personName?: string },
): Promise<Page> {
  return req('PUT', `/page?id=${encodeURIComponent(pageId)}`, patch, {
    Authorization: `Bearer ${passwordHash}`,
  })
}

export function verifyPassword(
  pageId: string,
  passwordHash: string,
): Promise<{ valid: boolean }> {
  return req('POST', `/verify?id=${encodeURIComponent(pageId)}`, { passwordHash })
}

export function searchPages(
  name: string,
): Promise<{ pages: { id: string; personName: string; createdAt: string }[] }> {
  return req('GET', `/pages?name=${encodeURIComponent(name.toLowerCase().trim())}`)
}

export function getClaims(pageId: string, coordToken: string): Promise<Claim[]> {
  return req(
    'GET',
    `/claims?id=${encodeURIComponent(pageId)}&coord=${encodeURIComponent(coordToken)}`,
  )
}

export function createClaim(
  pageId: string,
  wishId: string,
  claimedBy: string,
): Promise<Claim> {
  return req('POST', `/claims?id=${encodeURIComponent(pageId)}`, { wishId, claimedBy })
}

export function deleteClaim(pageId: string, claimId: string): Promise<void> {
  return req(
    'DELETE',
    `/claims?id=${encodeURIComponent(pageId)}&claimId=${encodeURIComponent(claimId)}`,
  )
}

export function getFinishes(pageId: string): Promise<Finish[]> {
  return req('GET', `/finishes?id=${encodeURIComponent(pageId)}`)
}

export function createFinish(pageId: string, wishId: string, finishedBy: string): Promise<Finish> {
  return req('POST', `/finishes?id=${encodeURIComponent(pageId)}`, { wishId, finishedBy })
}

export function deleteFinish(pageId: string, finishId: string): Promise<void> {
  return req(
    'DELETE',
    `/finishes?id=${encodeURIComponent(pageId)}&finishId=${encodeURIComponent(finishId)}`,
  )
}

export function getEvents(pageId: string, token: string): Promise<EventLog[]> {
  return req(
    'GET',
    `/events?id=${encodeURIComponent(pageId)}&token=${encodeURIComponent(token)}`,
  )
}

export function createEvent(
  pageId: string,
  event: { type: 'finish' | 'chipin'; wishId: string; actorName: string; amount?: number },
): Promise<EventLog> {
  return req('POST', `/events?id=${encodeURIComponent(pageId)}`, event)
}
