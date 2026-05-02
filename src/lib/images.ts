const CACHE_PREFIX = 'nbd:img:'
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined

function getCached(wishId: string): string | null {
  try {
    return localStorage.getItem(`${CACHE_PREFIX}${wishId}`)
  } catch {
    return null
  }
}

function setCache(wishId: string, url: string) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${wishId}`, url)
  } catch {
    // localStorage full — ignore
  }
}

export async function fetchWishImage(keyword: string, wishId: string): Promise<string | undefined> {
  if (!keyword.trim()) return undefined

  const cached = getCached(wishId)
  if (cached) return cached

  if (!ACCESS_KEY) return undefined

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=5&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } },
    )
    if (!res.ok) return undefined
    const data = await res.json()
    const results: { urls: { small: string } }[] = data.results ?? []
    if (results.length === 0) return undefined

    const seed = parseInt(wishId.replace(/-/g, '').slice(0, 8), 16)
    const url = results[seed % results.length].urls.small
    setCache(wishId, url)
    return url
  } catch {
    return undefined
  }
}
