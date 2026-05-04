import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'

export const config: Config = { path: '/pages' }

interface PageBlob {
  id: string
  personName: string
  createdAt: string
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405)

  const url = new URL(req.url)
  const name = url.searchParams.get('name')
  if (!name) return json({ error: 'Missing name' }, 400)

  const normalized = name.toLowerCase().trim()
  const store = getStore('birthday-pages')
  const pageIds = ((await store.get(`names:${normalized}`, { type: 'json' })) ?? []) as string[]

  const pages = await Promise.all(
    pageIds.map(async id => {
      const p = (await store.get(id, { type: 'json' })) as PageBlob | null
      if (!p) return null
      return { id: p.id, personName: p.personName, createdAt: p.createdAt }
    }),
  )

  return json({ pages: pages.filter(Boolean) })
}
