import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Verify } from './pages/Verify.tsx'
import { CommunityIntelligence } from './pages/advanced/CommunityIntelligence.tsx'
import { WalletWatchPlus } from './pages/advanced/WalletWatchPlus.tsx'
import { PrivacyControls } from './pages/advanced/PrivacyControls.tsx'
import { Accessibility } from './pages/advanced/Accessibility.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app" element={<App />} />
        <Route path="/app/more" element={<App />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/app/advanced/community-intelligence" element={<CommunityIntelligence />} />
        <Route path="/app/advanced/walletwatch-plus" element={<WalletWatchPlus />} />
        <Route path="/app/advanced/privacy-controls" element={<PrivacyControls />} />
        <Route path="/app/advanced/accessibility" element={<Accessibility />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
