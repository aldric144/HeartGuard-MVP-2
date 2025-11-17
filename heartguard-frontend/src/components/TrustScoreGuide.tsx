import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export function TrustScoreGuide() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/95 border-[#3C4B7C] border-2 rounded-xl shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#3C4B7C]" />
            <div>
              <CardTitle className="text-2xl text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                Trust Score Guide
              </CardTitle>
              <CardDescription className="text-[#5B3256]/70">
                Understanding HeartGuard™ risk levels
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Scale */}
          <div className="bg-[#F5E8DC] p-6 rounded-xl">
            <h3 className="text-lg font-bold text-[#5B3256] mb-4">Trust Score Scale</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  70-100
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-blue-600">Low Risk - Safe</h4>
                  </div>
                  <p className="text-sm text-[#5B3256]/70">
                    Connection appears trustworthy. Minimal red flags detected.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                  40-69
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-5 h-5 text-orange-600" />
                    <h4 className="font-bold text-orange-600">Medium Risk - Caution</h4>
                  </div>
                  <p className="text-sm text-[#5B3256]/70">
                    Some concerning patterns detected. Proceed with caution and verify claims.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                  0-39
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-bold text-red-600">High Risk - DANGER!</h4>
                  </div>
                  <p className="text-sm text-[#5B3256]/70">
                    Multiple red flags detected. Strong indicators of potential scam.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Principle */}
          <Card className="bg-gradient-to-br from-[#5B3256] to-[#3C4B7C] text-white border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                ⚠️ Key Principle
              </h3>
              <p className="text-lg mb-2">
                <strong>Lower Score = Higher Risk</strong>
              </p>
              <p className="text-white/90">
                When the trust score drops, the danger increases. A score of 30 is MORE dangerous than a score of 70.
              </p>
            </CardContent>
          </Card>

          {/* Guardian Mode Alerts */}
          <Card className="bg-[#F5E8DC] border-[#E6B7BE]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#5B3256] mb-3">Guardian Mode™ Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3C4B7C] flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-[#5B3256]">Set Minimum Safe Score</p>
                    <p className="text-sm text-[#5B3256]/70">
                      Choose the threshold (default 40). You'll be alerted when the score drops below this number.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3C4B7C] flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-[#5B3256]">Alert Triggers</p>
                    <p className="text-sm text-[#5B3256]/70">
                      Alerts fire when: (1) Trust score drops below your minimum safe score, OR (2) Financial manipulation patterns detected (instant alert regardless of score).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3C4B7C] flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-[#5B3256]">Smart Cooldown</p>
                    <p className="text-sm text-[#5B3256]/70">
                      60-minute cooldown per contact prevents alert fatigue while keeping you protected.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Affects Trust Score */}
          <Card className="bg-white border-[#3C4B7C]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#5B3256] mb-4">What Affects Trust Score?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[#5B3256] mb-2 flex items-center gap-2">
                    <span className="text-red-600">↓</span> Lowers Score (Increases Risk)
                  </h4>
                  <ul className="space-y-1 text-sm text-[#5B3256]/70">
                    <li>• Financial requests</li>
                    <li>• Cryptocurrency/gift card requests</li>
                    <li>• Emotional manipulation patterns</li>
                    <li>• Fake/stolen photos</li>
                    <li>• Inconsistent profile information</li>
                    <li>• VPN/Tor usage</li>
                    <li>• Rapid sentiment shifts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[#5B3256] mb-2 flex items-center gap-2">
                    <span className="text-blue-600">↑</span> Raises Score (Decreases Risk)
                  </h4>
                  <ul className="space-y-1 text-sm text-[#5B3256]/70">
                    <li>• Consistent communication</li>
                    <li>• Authentic photos</li>
                    <li>• Verifiable information</li>
                    <li>• Normal sentiment patterns</li>
                    <li>• No financial requests</li>
                    <li>• Legitimate location data</li>
                    <li>• Stable emotional tone</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Scenarios */}
          <Card className="bg-[#E6B7BE]/20 border-[#E6B7BE]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#5B3256] mb-4">Example Scenarios</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-600 mb-1">Score: 85 (Low Risk)</p>
                  <p className="text-sm text-[#5B3256]/70">
                    "Met on dating app, video chatted multiple times, consistent story, no money requests. Photos appear authentic."
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="font-semibold text-orange-600 mb-1">Score: 55 (Medium Risk)</p>
                  <p className="text-sm text-[#5B3256]/70">
                    "Claims to be military overseas, some inconsistencies in story, avoids video calls. No financial requests yet."
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-semibold text-red-600 mb-1">Score: 25 (High Risk)</p>
                  <p className="text-sm text-[#5B3256]/70">
                    "Requested money for 'emergency', photos found on reverse image search, using VPN, emotional manipulation detected."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
