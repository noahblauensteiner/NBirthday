import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import WishList from './pages/WishList'
import FirstCelebratorModal from './components/FirstCelebratorModal'
import AccessModal from './components/AccessModal'
import LoadingScreen from './components/LoadingScreen'
import ErrorScreen from './components/ErrorScreen'
import PagePicker from './components/PagePicker'
import { parseUrl } from './lib/sharing'
import { getOwnerToken, saveOwnerToken, saveCoordToken } from './lib/storage'
import { provider, ProviderError } from './lib/providers'
import type { Page, ViewMode, Wish } from './types'

type PageResult = { id: string; personName: string; createdAt: string }

type AppState =
  | { mode: 'landing' }
  | { mode: 'loading' }
  | { mode: 'error'; message: string }
  | { mode: 'picker'; results: PageResult[] }
  | { mode: 'first-celebrator'; pendingName: string }
  | { mode: 'access-check'; page: Page }
  | { mode: 'wishlist'; page: Page; viewMode: ViewMode }

function getInitialState(): AppState {
  const parsed = parseUrl()

  // Legacy ?for=&w= link — render immediately in friend mode, no API call needed
  if (parsed?.type === 'legacy') {
    return {
      mode: 'wishlist',
      page: {
        id: '',
        personName: parsed.name,
        wishes: parsed.wishes,
        createdAt: '',
        updatedAt: '',
      },
      viewMode: 'friend',
    }
  }

  // ?p= link — need async fetch, start with loading state
  if (parsed?.type === 'pageId') return { mode: 'loading' }

  return { mode: 'landing' }
}

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState)

  // Resolve ?p= URL on mount
  useEffect(() => {
    const parsed = parseUrl()
    if (parsed?.type !== 'pageId') return
    loadPageAndRoute(parsed.pageId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPageAndRoute(pageId: string, skipAutoLogin = false) {
    setState({ mode: 'loading' })
    try {
      const page = await provider.getPage(pageId)
      window.history.replaceState({}, '', `/?p=${pageId}`)

      // Auto-login only on direct ?p= URL loads — not when arriving via name search,
      // so the owner can choose to view as a visitor after clicking back.
      if (!skipAutoLogin) {
        const ownerToken = getOwnerToken(pageId)
        if (ownerToken) {
          const { valid } = await provider.verifyPassword(pageId, ownerToken)
          if (valid) {
            setState({ mode: 'wishlist', page, viewMode: 'owner' })
            return
          }
        }
      }

      const urlCoord = new URLSearchParams(window.location.search).get('coord')
      if (urlCoord) {
        setState({ mode: 'wishlist', page, viewMode: 'coordinator' })
        return
      }

      setState({ mode: 'access-check', page })
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        setState({ mode: 'error', message: 'This birthday page no longer exists.' })
      } else {
        setState({ mode: 'error', message: 'Could not load the page. Check your connection.' })
      }
    }
  }

  async function handleNameSubmit(name: string) {
    setState({ mode: 'loading' })
    try {
      const pages = await provider.searchPages(name)
      if (pages.length === 0) {
        setState({ mode: 'first-celebrator', pendingName: name })
      } else if (pages.length === 1) {
        await loadPageAndRoute(pages[0].id, true)
      } else {
        setState({ mode: 'picker', results: pages })
      }
    } catch {
      setState({ mode: 'error', message: 'Search failed. Please try again.' })
    }
  }

  async function handleCreateSession(name: string, passwordHash: string) {
    setState({ mode: 'loading' })
    try {
      const { id, coordToken } = await provider.createPage(name, passwordHash)
      saveOwnerToken(id, passwordHash)
      saveCoordToken(id, coordToken)
      window.history.replaceState({}, '', `/?p=${id}`)
      const page = await provider.getPage(id)
      setState({ mode: 'wishlist', page, viewMode: 'owner' })
    } catch {
      setState({ mode: 'error', message: 'Could not create birthday page. Try again.' })
    }
  }

  function handleOwnerAccess(page: Page, hash: string) {
    saveOwnerToken(page.id, hash)
    setState({ mode: 'wishlist', page, viewMode: 'owner' })
  }

  function handleFriendAccess(page: Page) {
    setState({ mode: 'wishlist', page, viewMode: 'friend' })
  }

  async function handleSessionUpdate(updatedWishes: Wish[]) {
    if (state.mode !== 'wishlist') return
    const { page } = state
    const ownerToken = getOwnerToken(page.id)
    if (!ownerToken) return

    // Optimistic local update
    setState(prev =>
      prev.mode === 'wishlist'
        ? { ...prev, page: { ...prev.page, wishes: updatedWishes } }
        : prev,
    )

    try {
      const updated = await provider.updatePage(page.id, ownerToken, { wishes: updatedWishes })
      setState(prev =>
        prev.mode === 'wishlist' ? { ...prev, page: updated } : prev,
      )
    } catch (err) {
      if (err instanceof ProviderError && (err.status === 401 || err.status === 403)) {
        setState({ mode: 'access-check', page })
      }
    }
  }

  function handleBack() {
    window.history.replaceState({}, '', window.location.pathname)
    setState({ mode: 'landing' })
  }

  if (state.mode === 'loading') return <LoadingScreen />

  if (state.mode === 'error') {
    return <ErrorScreen message={state.message} onBack={handleBack} />
  }

  if (state.mode === 'picker') {
    return (
      <PagePicker
        results={state.results}
        onSelect={id => loadPageAndRoute(id, true)}
        onBack={handleBack}
      />
    )
  }

  if (state.mode === 'landing') {
    return <Landing onSubmit={handleNameSubmit} />
  }

  if (state.mode === 'first-celebrator') {
    return (
      <>
        <Landing onSubmit={handleNameSubmit} />
        <FirstCelebratorModal
          name={state.pendingName}
          onCreate={hash => handleCreateSession(state.pendingName, hash)}
          onBack={() => setState({ mode: 'landing' })}
        />
      </>
    )
  }

  if (state.mode === 'access-check') {
    return (
      <>
        <Landing onSubmit={handleNameSubmit} />
        <AccessModal
          page={state.page}
          onOwner={hash => handleOwnerAccess(state.page, hash)}
          onFriend={() => handleFriendAccess(state.page)}
        />
      </>
    )
  }

  return (
    <WishList
      page={state.page}
      viewMode={state.viewMode}
      onUpdate={handleSessionUpdate}
      onBack={handleBack}
    />
  )
}
