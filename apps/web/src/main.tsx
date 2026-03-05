import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { useAuthStore } from './shared/store/useAuthStore'
import './index.css'

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Une nouvelle version est disponible. Recharger ?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

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
