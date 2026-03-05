import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { useAuthStore } from './shared/store/useAuthStore'
import './index.css'

const registerServiceWorker = (): void => {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  let shouldReloadOnControllerChange = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (shouldReloadOnControllerChange) {
      window.location.reload()
    }
  })

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      if (registration.waiting && navigator.serviceWorker.controller) {
        if (window.confirm('Une nouvelle version est disponible. Recharger ?')) {
          shouldReloadOnControllerChange = true
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing
        if (!installingWorker) return

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state !== 'installed') return

          if (!navigator.serviceWorker.controller) {
            console.log('App ready to work offline')
            return
          }

          if (window.confirm('Une nouvelle version est disponible. Recharger ?')) {
            shouldReloadOnControllerChange = true
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  })
}

registerServiceWorker()

const QueryProviderShell = React.lazy(() => import('./shared/providers/QueryProviderShell'))

const AppRoot: React.FC = () => {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <App />
  }

  return (
    <React.Suspense fallback={<App />}>
      <QueryProviderShell>
        <App />
      </QueryProviderShell>
    </React.Suspense>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoot />
    </BrowserRouter>
  </React.StrictMode>,
)
