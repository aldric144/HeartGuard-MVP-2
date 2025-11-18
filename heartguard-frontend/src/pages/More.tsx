import { Shield, Globe, Lock, Accessibility, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

export function More() {
  const navigate = useNavigate()
  const features = [
    {
      id: 'community',
      title: 'Community Intelligence',
      description: 'Privacy-preserving scammer detection network',
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'Available',
      path: '/app/advanced/community-intelligence'
    },
    {
      id: 'crypto',
      title: 'WalletWatch™ Plus',
      description: 'Cryptocurrency address screening and transaction analysis',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'Available',
      path: '/app/advanced/walletwatch-plus'
    },
    {
      id: 'privacy',
      title: 'Privacy Controls',
      description: 'GDPR-compliant data management and retention',
      icon: Lock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'Available',
      path: '/app/advanced/privacy-controls'
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Trauma-aware experience with emergency support',
      icon: Accessibility,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'Available',
      path: '/app/advanced/accessibility'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E8DC] via-[#E6B7BE]/30 to-[#3C4B7C]/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#5B3256] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Advanced Features
          </h1>
          <p className="text-[#5B3256]/70">
            Explore additional protection tools and settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card 
                key={feature.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${feature.bgColor} mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      {feature.status}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-[#5B3256]">{feature.title}</CardTitle>
                  <CardDescription className="text-[#5B3256]/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button className="flex items-center gap-2 text-sm font-semibold text-[#3C4B7C] hover:text-[#5B3256] transition-colors">
                    Open Feature
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg border-2 border-[#E6B7BE]">
          <h2 className="text-xl font-bold text-[#5B3256] mb-4">Advanced Features Now Available</h2>
          <p className="text-[#5B3256]/70 mb-4">
            All advanced features are now fully functional. Click on any feature card above to get started.
          </p>
          <ul className="space-y-2 text-sm text-[#5B3256]/70">
            <li>• Report suspected scammers to the community network</li>
            <li>• Screen cryptocurrency addresses against known scam databases</li>
            <li>• Manage data retention and privacy settings</li>
            <li>• Access emergency contacts and trauma-aware support</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
