import type { DataProvider } from './types'
import { NetlifyProvider } from './netlify'
import { LocalStorageProvider } from './localstorage'

export type { DataProvider } from './types'
export { ProviderError } from './types'

function createProvider(): DataProvider {
  // Dev: use localStorage unless explicitly opted into Netlify (e.g. VITE_DATA_PROVIDER=netlify npm run dev)
  if (import.meta.env.DEV && import.meta.env.VITE_DATA_PROVIDER !== 'netlify') {
    console.info('[provider] using LocalStorageProvider (dev mode)')
    return new LocalStorageProvider()
  }
  return new NetlifyProvider()
}

export const provider: DataProvider = createProvider()
