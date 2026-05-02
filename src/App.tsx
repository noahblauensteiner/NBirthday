import { useState } from 'react'
import Landing from './pages/Landing'
import WishList from './pages/WishList'
import { parseShareUrl } from './lib/sharing'
import { loadSession, saveSession, getEditToken, saveEditToken } from './lib/storage'
import type { Session } from './types'

type AppState =
  | { mode: 'landing' }
  | { mode: 'wishlist'; session: Session; canEdit: boolean }

function getInitialState(): AppState {
  const shared = parseShareUrl()
  if (shared) {
    return {
      mode: 'wishlist',
      session: { name: shared.name, wishes: shared.wishes, editToken: '' },
      canEdit: false,
    }
  }
  return { mode: 'landing' }
}

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState)

  function handleNameSubmit(name: string) {
    const existing = loadSession(name)
    const localToken = getEditToken(name)

    if (existing) {
      setState({
        mode: 'wishlist',
        session: existing,
        canEdit: !!localToken && localToken === existing.editToken,
      })
    } else {
      const editToken = crypto.randomUUID()
      const newSession: Session = { name, wishes: [], editToken }
      saveSession(newSession)
      saveEditToken(name, editToken)
      setState({ mode: 'wishlist', session: newSession, canEdit: true })
    }
  }

  function handleSessionUpdate(session: Session) {
    saveSession(session)
    setState(prev =>
      prev.mode === 'wishlist' ? { ...prev, session } : prev,
    )
  }

  function handleBack() {
    // Clear share params from URL without reload
    window.history.replaceState({}, '', window.location.pathname)
    setState({ mode: 'landing' })
  }

  if (state.mode === 'landing') {
    return <Landing onSubmit={handleNameSubmit} />
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
