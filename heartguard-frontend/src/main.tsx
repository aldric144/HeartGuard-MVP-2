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
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SignUp } from './pages/auth/SignUp'
import { Login } from './pages/auth/Login'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { QATestAuth } from './pages/auth/QATestAuth'
import { Toaster } from './components/ui/toaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<App />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
          <Route path="/verify" element={<Verify />} />
          
          {/* Protected routes */}
          <Route path="/app" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/app/more" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/app/advanced/community-intelligence" element={<ProtectedRoute><CommunityIntelligence /></ProtectedRoute>} />
          <Route path="/app/advanced/walletwatch-plus" element={<ProtectedRoute><WalletWatchPlus /></ProtectedRoute>} />
          <Route path="/app/advanced/privacy-controls" element={<ProtectedRoute><PrivacyControls /></ProtectedRoute>} />
          <Route path="/app/advanced/accessibility" element={<ProtectedRoute><Accessibility /></ProtectedRoute>} />
          
          {/* QA Test route (admin only) */}
          <Route path="/qa-test/auth" element={<QATestAuth />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
