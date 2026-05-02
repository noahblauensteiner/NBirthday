import { useState } from 'react'
import Landing from './pages/Landing'
import WishList from './pages/WishList'
import FirstCelebratorModal from './components/FirstCelebratorModal'
import AccessModal from './components/AccessModal'
import { parseShareUrl } from './lib/sharing'
import { loadSession, saveSession, getEditToken, saveEditToken } from './lib/storage'
import type { Session } from './types'

type AppState =
  | { mode: 'landing' }
  | { mode: 'first-celebrator'; pendingName: string }
  | { mode: 'access-check'; session: Session }
  | { mode: 'wishlist'; session: Session; canEdit: boolean }

function getInitialState(): AppState {
  const shared = parseShareUrl()
  if (shared) {
    return {
      mode: 'wishlist',
      session: { name: shared.name, wishes: shared.wishes, passwordHash: '' },
      canEdit: false,
    }
  }
  return { mode: 'landing' }
}

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState)

  function handleNameSubmit(name: string) {
    const existing = loadSession(name)

    if (!existing) {
      setState({ mode: 'first-celebrator', pendingName: name })
      return
    }

    // Same device that already authenticated → skip modal
    const localToken = getEditToken(name)
    if (localToken && localToken === existing.passwordHash) {
      setState({ mode: 'wishlist', session: existing, canEdit: true })
      return
    }

    setState({ mode: 'access-check', session: existing })
  }

  function handleCreateSession(name: string, passwordHash: string) {
    const session: Session = { name, wishes: [], passwordHash }
    saveSession(session)
    saveEditToken(name, passwordHash)
    setState({ mode: 'wishlist', session, canEdit: true })
  }

  function handleOwnerAccess(session: Session) {
    saveEditToken(session.name, session.passwordHash)
    setState({ mode: 'wishlist', session, canEdit: true })
  }

  function handleFriendAccess(session: Session) {
    setState({ mode: 'wishlist', session, canEdit: false })
  }

  function handleSessionUpdate(session: Session) {
    saveSession(session)
    setState(prev =>
      prev.mode === 'wishlist' ? { ...prev, session } : prev,
    )
  }

  function handleBack() {
    window.history.replaceState({}, '', window.location.pathname)
    setState({ mode: 'landing' })
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
          session={state.session}
          onOwner={() => handleOwnerAccess(state.session)}
          onFriend={() => handleFriendAccess(state.session)}
        />
      </>
    )
  }

  return (
    <WishList
      session={state.session}
      canEdit={state.canEdit}
      onUpdate={handleSessionUpdate}
      onBack={handleBack}
    />
  )
}
