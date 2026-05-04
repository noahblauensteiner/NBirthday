import { getStore } from '@netlify/blobs'

interface PageBlob { passwordHash: string }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const url = new URL(req.url)
  const pageId = url.searchParams.get('id')
  if (!pageId) return json({ error: 'Missing id' }, 400)

  const body = await req.json().catch(() => null) as Record<string, unknown> | null
  if (!body?.passwordHash) return json({ error: 'passwordHash required' }, 400)

  const store = getStore('birthday-pages')
  const page = (await store.get(pageId, { type: 'json' })) as PageBlob | null
  if (!page) return json({ error: 'Not found' }, 404)

  return json({ valid: page.passwordHash === body.passwordHash })
}
