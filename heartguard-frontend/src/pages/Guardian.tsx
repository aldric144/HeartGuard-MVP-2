import { Shield, Users, Bell, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface GuardianProps {
  conversationId?: string
  onNavigateToFamily?: () => void
}

export function Guardian({ conversationId, onNavigateToFamily }: GuardianProps) {
  if (!conversationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E8DC] via-[#E6B7BE]/30 to-[#3C4B7C]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#5B3256] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Guardian Dashboard
            </h1>
            <p className="text-[#5B3256]/70">
              Monitor and protect your conversations with real-time alerts and insights.
            </p>
          </div>

          <Card className="bg-white/95 border-[#3C4B7C] border-2 rounded-xl shadow-lg mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#3C4B7C]" />
                <div>
                  <CardTitle className="text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    No Active Analysis
                  </CardTitle>
                  <CardDescription className="text-[#5B3256]/70">
                    Start analyzing a conversation to enable Guardian Mode
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#5B3256]/80">
                Guardian Mode provides real-time protection for your active conversations. To get started:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#5B3256]/80">
                <li>Go to the <strong>Home</strong> tab</li>
                <li>Upload a photo or paste chat messages</li>
                <li>Generate a Trust Score analysis</li>
                <li>Guardian Mode will automatically activate for that conversation</li>
              </ol>
              <div className="pt-4 border-t border-[#3C4B7C]/20">
                <p className="text-sm text-[#5B3256]/70 mb-3">
                  Want to manage trusted contacts for all your conversations?
                </p>
                <Button
                  onClick={onNavigateToFamily}
                  className="bg-[#3C4B7C] hover:bg-[#3C4B7C]/90 text-white"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Go to FamilyLink
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white/95 border-[#E6B7BE] border-2">
              <CardHeader>
                <Shield className="w-6 h-6 text-[#3C4B7C] mb-2" />
                <CardTitle className="text-sm text-[#5B3256]">Real-Time Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[#5B3256]/70">
                  Monitor conversations as they happen with instant risk alerts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 border-[#E6B7BE] border-2">
              <CardHeader>
                <Bell className="w-6 h-6 text-[#3C4B7C] mb-2" />
                <CardTitle className="text-sm text-[#5B3256]">Smart Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[#5B3256]/70">
                  Notify trusted contacts when concerning patterns are detected
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 border-[#E6B7BE] border-2">
              <CardHeader>
                <TrendingUp className="w-6 h-6 text-[#3C4B7C] mb-2" />
                <CardTitle className="text-sm text-[#5B3256]">Trust Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[#5B3256]/70">
                  Track how trust scores evolve over the course of your conversation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E8DC] via-[#E6B7BE]/30 to-[#3C4B7C]/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#5B3256] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Guardian Dashboard
          </h1>
          <p className="text-[#5B3256]/70">
            Active protection for conversation: {conversationId.substring(0, 8)}...
          </p>
        </div>

        <Card className="bg-white/95 border-[#3C4B7C] border-2 rounded-xl shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <CardTitle className="text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Conversation Protection Active
                </CardTitle>
                <CardDescription className="text-[#5B3256]/70">
                  Guardian Mode is monitoring this conversation for concerning patterns
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#F5E8DC] border-2 border-[#3C4B7C] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#5B3256]">Monitoring Status</span>
                <span className="text-xs text-green-600 font-semibold">ACTIVE</span>
              </div>
              <p className="text-xs text-[#5B3256]/70">
                Real-time analysis is enabled for this conversation. You'll be alerted if concerning patterns are detected.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-[#E6B7BE] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-[#3C4B7C]" />
                  <span className="text-sm font-semibold text-[#5B3256]">Trust Score Tracking</span>
                </div>
                <p className="text-xs text-[#5B3256]/70">
                  View detailed analysis in the <strong>Results</strong> tab
                </p>
              </div>

              <div className="bg-white border-2 border-[#E6B7BE] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#3C4B7C]" />
                  <span className="text-sm font-semibold text-[#5B3256]">Trusted Contacts</span>
                </div>
                <p className="text-xs text-[#5B3256]/70">
                  Manage alerts in the <strong>Family</strong> tab
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#3C4B7C]/20">
              <Button
                onClick={onNavigateToFamily}
                className="w-full bg-[#3C4B7C] hover:bg-[#3C4B7C]/90 text-white"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Trusted Contacts
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/95 border-[#E6B7BE] border-2">
            <CardHeader>
              <Shield className="w-6 h-6 text-[#3C4B7C] mb-2" />
              <CardTitle className="text-sm text-[#5B3256]">Real-Time Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#5B3256]/70">
                Continuous monitoring of conversation patterns and risk indicators
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border-[#E6B7BE] border-2">
            <CardHeader>
              <Bell className="w-6 h-6 text-[#3C4B7C] mb-2" />
              <CardTitle className="text-sm text-[#5B3256]">Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#5B3256]/70">
                Automatic notifications to trusted contacts when risks are detected
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border-[#E6B7BE] border-2">
            <CardHeader>
              <TrendingUp className="w-6 h-6 text-[#3C4B7C] mb-2" />
              <CardTitle className="text-sm text-[#5B3256]">Evidence Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#5B3256]/70">
                Automatic documentation for legal-grade evidence reports
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
