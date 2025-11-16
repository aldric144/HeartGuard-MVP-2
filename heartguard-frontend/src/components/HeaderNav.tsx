import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderNavProps {
  activeTab: 'home' | 'results' | 'guardian' | 'guide'
  onTabChange: (tab: 'home' | 'results' | 'guardian' | 'guide') => void
  onHelpClick: () => void
  hasResults: boolean
}

export function HeaderNav({ activeTab, onTabChange, onHelpClick, hasResults }: HeaderNavProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Analyze Connection'
      case 'results':
        return 'Trust Score Results'
      case 'guardian':
        return 'Guardian Mode™'
      case 'guide':
        return 'Trust Score Guide'
      default:
        return 'HeartGuard™'
    }
  }

  const canGoBack = () => {
    if (activeTab === 'results' || activeTab === 'guardian') return true
    return false
  }

  const canGoForward = () => {
    if (activeTab === 'home' && hasResults) return true
    if (activeTab === 'results') return true
    return false
  }

  const handleBack = () => {
    if (activeTab === 'results') {
      onTabChange('home')
    } else if (activeTab === 'guardian') {
      onTabChange('results')
    }
  }

  const handleForward = () => {
    if (activeTab === 'home' && hasResults) {
      onTabChange('results')
    } else if (activeTab === 'results') {
      onTabChange('guardian')
    }
  }

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-[#3C4B7C] shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Back/Forward Navigation */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBack}
              disabled={!canGoBack()}
              variant="ghost"
              size="sm"
              className={`${
                canGoBack()
                  ? 'text-[#3C4B7C] hover:bg-[#E6B7BE]/20'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleForward}
              disabled={!canGoForward()}
              variant="ghost"
              size="sm"
              className={`${
                canGoForward()
                  ? 'text-[#3C4B7C] hover:bg-[#E6B7BE]/20'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
              title={!hasResults && activeTab === 'home' ? 'Run an analysis first' : ''}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Page Title */}
          <h1 className="text-lg md:text-xl font-bold text-[#5B3256] flex-1 text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {getTabTitle()}
          </h1>

          {/* Help Button */}
          <Button
            onClick={onHelpClick}
            variant="ghost"
            size="sm"
            className="text-[#3C4B7C] hover:bg-[#E6B7BE]/20"
            style={{ minHeight: '44px', minWidth: '44px' }}
            title="Trust Score Guide"
          >
            <HelpCircle className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
