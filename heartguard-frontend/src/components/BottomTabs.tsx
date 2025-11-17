import { Home, FileText, Shield, Users, MoreHorizontal } from 'lucide-react'

interface BottomTabsProps {
  activeTab: 'home' | 'results' | 'guardian' | 'family' | 'more'
  onTabChange: (tab: 'home' | 'results' | 'guardian' | 'family' | 'more') => void
  hasResults: boolean
}

export function BottomTabs({ activeTab, onTabChange, hasResults }: BottomTabsProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home, enabled: true },
    { id: 'results' as const, label: 'Results', icon: FileText, enabled: true },
    { id: 'guardian' as const, label: 'Guardian', icon: Shield, enabled: true },
    { id: 'family' as const, label: 'Family', icon: Users, enabled: true },
    { id: 'more' as const, label: 'More', icon: MoreHorizontal, enabled: true },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#3C4B7C] z-40 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isDisabled = !tab.enabled

            return (
              <button
                key={tab.id}
                onClick={() => tab.enabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-[#3C4B7C] bg-[#E6B7BE]/20'
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#5B3256] hover:bg-[#F5E8DC]'
                }`}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-[#3C4B7C] z-40 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-[#E6B7BE]" />
            <div>
              <h2 className="text-xl font-bold text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                HeartGuard™
              </h2>
              <p className="text-xs text-[#5B3256]/70">Safer Connections</p>
            </div>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isDisabled = !tab.enabled

              return (
                <button
                  key={tab.id}
                  onClick={() => tab.enabled && onTabChange(tab.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#3C4B7C] text-white shadow-lg'
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#5B3256] hover:bg-[#F5E8DC]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                  {isDisabled && !isActive && (
                    <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">
                      Locked
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="mt-8 p-4 bg-[#F5E8DC] rounded-lg">
            <p className="text-xs text-[#5B3256] font-semibold mb-2">
              💡 Quick Tip
            </p>
            <p className="text-xs text-[#5B3256]/70">
              Lower trust score = Higher risk. Scores below 40 indicate danger!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
