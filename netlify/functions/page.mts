import { getStore } from '@netlify/blobs'
import { nanoid } from 'nanoid'
import type { Config } from '@netlify/functions'

export const config: Config = { path: '/page' }

interface Wish {
  id: string
  type: string
  title: string
  note?: string
  url?: string
  picture?: string
  price?: number
}

interface PageBlob {
  id: string
  personName: string
  passwordHash: string
  coordToken: string
  wishes: Wish[]
  eventDate?: string
  createdAt: string
  updatedAt: string
}

function toPublic(page: PageBlob) {
  const { passwordHash: _ph, coordToken: _ct, ...pub } = page
  return pub
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async (req: Request) => {
  const store = getStore('birthday-pages')
  const url = new URL(req.url)
  const pageId = url.searchParams.get('id')

  // GET /page?id=
  if (req.method === 'GET') {
    if (!pageId) return json({ error: 'Missing id' }, 400)
    const raw = await store.get(pageId, { type: 'json' })
    if (!raw) return json({ error: 'Not found' }, 404)
    return json(toPublic(raw as PageBlob))
  }

  // POST /page — create
  if (req.method === 'POST') {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    if (!body?.personName || !body?.passwordHash) {
      return json({ error: 'personName and passwordHash required' }, 400)
    }
    const id = nanoid(10)
    const coordToken = nanoid(8)
    const now = new Date().toISOString()
    const page: PageBlob = {
      id,
      personName: body.personName as string,
      passwordHash: body.passwordHash as string,
      coordToken,
      wishes: (body.wishes as Wish[]) ?? [],
      createdAt: now,
      updatedAt: now,
    }
    await store.setJSON(id, page)

    // Update name index
    const normalized = (body.personName as string).toLowerCase().trim()
    const indexKey = `names:${normalized}`
    const existing = ((await store.get(indexKey, { type: 'json' })) ?? []) as string[]
    await store.setJSON(indexKey, [...existing, id])

    return json({ id, coordToken }, 201)
  }

  // PUT /page?id= — update
  if (req.method === 'PUT') {
    if (!pageId) return json({ error: 'Missing id' }, 400)
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return json({ error: 'Unauthorized' }, 401)

    const current = (await store.get(pageId, { type: 'json' })) as PageBlob | null
    if (!current) return json({ error: 'Not found' }, 404)
    if (current.passwordHash !== token) return json({ error: 'Forbidden' }, 403)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const updated: PageBlob = {
      ...current,
      ...(body.wishes !== undefined && { wishes: body.wishes as Wish[] }),
      ...(body.personName !== undefined && { personName: body.personName as string }),
      updatedAt: new Date().toISOString(),
    }

    // Re-index if name changed
    if (body.personName && body.personName !== current.personName) {
      const oldKey = `names:${current.personName.toLowerCase().trim()}`
      const oldIds = ((await store.get(oldKey, { type: 'json' })) ?? []) as string[]
      await store.setJSON(oldKey, oldIds.filter(id => id !== pageId))
      const newKey = `names:${(body.personName as string).toLowerCase().trim()}`
      const newIds = ((await store.get(newKey, { type: 'json' })) ?? []) as string[]
      await store.setJSON(newKey, [...newIds, pageId])
    }

    await store.setJSON(pageId, updated)
    return json(toPublic(updated))
  }

  return json({ error: 'Method not allowed' }, 405)
}
