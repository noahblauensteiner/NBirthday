import { getStore } from '@netlify/blobs'
import { nanoid } from 'nanoid'

interface Finish { id: string; wishId: string; finishedBy: string; finishedAt: string }
interface FinishesBlob { finishes: Finish[] }
interface PageBlob { wishes: { id: string }[] }
interface EventsBlob { events: EventLog[] }
interface EventLog { id: string; type: string; wishId: string; actorName: string; amount?: number; createdAt: string }

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
  const finishesKey = `${pageId}:finishes`

  if (req.method === 'GET') {
    const blob = ((await store.get(finishesKey, { type: 'json' })) ?? { finishes: [] }) as FinishesBlob
    return json(blob.finishes)
  }

  if (req.method === 'POST') {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    const wishId = body?.wishId as string | undefined
    const finishedBy = (body?.finishedBy as string | undefined)?.trim()
    if (!wishId || !finishedBy) return json({ error: 'wishId and finishedBy required' }, 400)
    if (finishedBy.length > 60) return json({ error: 'finishedBy too long' }, 400)

    const page = (await store.get(pageId, { type: 'json' })) as PageBlob | null
    if (!page) return json({ error: 'Not found' }, 404)
    if (!page.wishes.some(w => w.id === wishId)) return json({ error: 'Wish not found' }, 400)

    const blob = ((await store.get(finishesKey, { type: 'json' })) ?? { finishes: [] }) as FinishesBlob
    if (blob.finishes.some(f => f.wishId === wishId)) return json({ error: 'Already finished' }, 409)

    const finish: Finish = { id: nanoid(8), wishId, finishedBy, finishedAt: new Date().toISOString() }
    blob.finishes.push(finish)
    await store.setJSON(finishesKey, blob)

    // Write event log
    const eventsKey = `${pageId}:events`
    const eventsBlob = ((await store.get(eventsKey, { type: 'json' })) ?? { events: [] }) as EventsBlob
    eventsBlob.events.push({ id: nanoid(8), type: 'finish', wishId, actorName: finishedBy, createdAt: finish.finishedAt })
    await store.setJSON(eventsKey, eventsBlob)

    return json(finish, 201)
  }

  if (req.method === 'DELETE') {
    const finishId = url.searchParams.get('finishId')
    if (!finishId) return json({ error: 'Missing finishId' }, 400)

    const blob = ((await store.get(finishesKey, { type: 'json' })) ?? { finishes: [] }) as FinishesBlob
    const filtered = blob.finishes.filter(f => f.id !== finishId)
    if (filtered.length === blob.finishes.length) return json({ error: 'Not found' }, 404)
    await store.setJSON(finishesKey, { finishes: filtered })
    return new Response(null, { status: 204 })
  }

  return json({ error: 'Method not allowed' }, 405)
}
