import { getStore } from '@netlify/blobs'
import { nanoid } from 'nanoid'

interface Claim {
  id: string
  wishId: string
  claimedBy: string
  claimedAt: string
}

interface ClaimsBlob { claims: Claim[] }
interface PageBlob { coordToken: string; wishes: { id: string }[] }

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
  const claimsKey = `${pageId}:claims`

  // GET /claims?id=&coord=
  if (req.method === 'GET') {
    const coordToken = url.searchParams.get('coord')
    if (!coordToken) return json({ error: 'Missing coord token' }, 401)

    const page = (await store.get(pageId, { type: 'json' })) as PageBlob | null
    if (!page) return json({ error: 'Not found' }, 404)
    if (page.coordToken !== coordToken) return json({ error: 'Forbidden' }, 403)

    const blob = ((await store.get(claimsKey, { type: 'json' })) ?? { claims: [] }) as ClaimsBlob
    return json(blob.claims)
  }

  // POST /claims?id=
  if (req.method === 'POST') {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    const wishId = body?.wishId as string | undefined
    const claimedBy = (body?.claimedBy as string | undefined)?.trim()
    if (!wishId || !claimedBy) return json({ error: 'wishId and claimedBy required' }, 400)
    if (claimedBy.length > 60) return json({ error: 'claimedBy too long' }, 400)

    const page = (await store.get(pageId, { type: 'json' })) as PageBlob | null
    if (!page) return json({ error: 'Not found' }, 404)

    // Verify wishId exists on this page
    if (!page.wishes.some(w => w.id === wishId)) {
      return json({ error: 'Wish not found' }, 400)
    }

    const blob = ((await store.get(claimsKey, { type: 'json' })) ?? { claims: [] }) as ClaimsBlob

    // Idempotency: one claim per wishId
    const existing = blob.claims.find(c => c.wishId === wishId)
    if (existing) return json({ error: 'Already claimed' }, 409)

    const claim: Claim = {
      id: nanoid(8),
      wishId,
      claimedBy,
      claimedAt: new Date().toISOString(),
    }
    blob.claims.push(claim)
    await store.setJSON(claimsKey, blob)

    return json({ ...claim, coordToken: page.coordToken }, 201)
  }

  // DELETE /claims?id=&claimId=
  if (req.method === 'DELETE') {
    const claimId = url.searchParams.get('claimId')
    if (!claimId) return json({ error: 'Missing claimId' }, 400)

    const blob = ((await store.get(claimsKey, { type: 'json' })) ?? { claims: [] }) as ClaimsBlob
    const filtered = blob.claims.filter(c => c.id !== claimId)
    if (filtered.length === blob.claims.length) return json({ error: 'Not found' }, 404)
    await store.setJSON(claimsKey, { claims: filtered })
    return new Response(null, { status: 204 })
  }

  return json({ error: 'Method not allowed' }, 405)
}
