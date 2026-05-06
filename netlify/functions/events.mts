import { getStore } from '@netlify/blobs'
import { nanoid } from 'nanoid'

interface EventLog { id: string; type: string; wishId: string; actorName: string; amount?: number; createdAt: string }
interface EventsBlob { events: EventLog[] }
interface PageBlob { passwordHash: string; coordToken: string }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const pageId = url.searchParams.get('id')
  if (!pageId) return json({ error: 'Missing id' }, 400)

  const store = getStore('birthday-pages')
  const eventsKey = `${pageId}:events`

  // GET ?id=&token= — owner hash or coord token
  if (req.method === 'GET') {
    const token = url.searchParams.get('token')
    if (!token) return json({ error: 'Missing token' }, 401)

    const page = (await store.get(pageId, { type: 'json' })) as PageBlob | null
    if (!page) return json({ error: 'Not found' }, 404)
    if (token !== page.passwordHash && token !== page.coordToken) return json({ error: 'Forbidden' }, 403)

    const blob = ((await store.get(eventsKey, { type: 'json' })) ?? { events: [] }) as EventsBlob
    return json(blob.events.slice().reverse())
  }

  // POST ?id= body { type, wishId, actorName, amount? } — no auth, logging only
  if (req.method === 'POST') {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    const type = body?.type as string | undefined
    const wishId = body?.wishId as string | undefined
    const actorName = (body?.actorName as string | undefined)?.trim()
    if (!type || !wishId || !actorName) return json({ error: 'type, wishId, actorName required' }, 400)
    if (!['finish', 'chipin'].includes(type)) return json({ error: 'Invalid type' }, 400)

    const blob = ((await store.get(eventsKey, { type: 'json' })) ?? { events: [] }) as EventsBlob
    const event: EventLog = {
      id: nanoid(8),
      type,
      wishId,
      actorName,
      amount: typeof body?.amount === 'number' ? body.amount : undefined,
      createdAt: new Date().toISOString(),
    }
    blob.events.push(event)
    await store.setJSON(eventsKey, blob)

    return json(event, 201)
  }

  return json({ error: 'Method not allowed' }, 405)
}
