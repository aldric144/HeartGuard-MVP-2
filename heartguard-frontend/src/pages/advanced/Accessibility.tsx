import { useState, useEffect } from 'react'
import { Accessibility as AccessibilityIcon, Phone, ArrowLeft, Volume2, Type, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://heartguard-backend.onrender.com'

interface EmergencyContact {
  name: string
  phone: string
}

export function Accessibility() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    largeTypeMode: false,
    voiceOverSummaries: false,
    traumaAwareMode: true
  })
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
    loadEmergencyContacts()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/accessibility/settings`)
      const data = await response.json()
      
      if (data.large_type_mode) {
        setSettings(prev => ({
          ...prev,
          largeTypeMode: data.large_type_mode.enabled || false
        }))
      }
      if (data.voice_over_summaries) {
        setSettings(prev => ({
          ...prev,
          voiceOverSummaries: data.voice_over_summaries.enabled || false
        }))
      }
      if (data.trauma_aware_mode) {
        setSettings(prev => ({
          ...prev,
          traumaAwareMode: data.trauma_aware_mode.enabled !== false
        }))
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error)
    }
  }

  const loadEmergencyContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/accessibility/emergency-contacts`)
      const data = await response.json()
      setEmergencyContacts(data)
    } catch (error) {
      console.error('Failed to load emergency contacts:', error)
    }
  }

  const handleToggleSetting = async (setting: keyof typeof settings) => {
    setLoading(true)
    const newValue = !settings[setting]
    
    try {
      setSettings(prev => ({ ...prev, [setting]: newValue }))
      
      
    } catch (error) {
      setSettings(prev => ({ ...prev, [setting]: !newValue }))
      console.error('Failed to update setting:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E8DC] via-[#E6B7BE]/30 to-[#3C4B7C]/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/app/more')}
          className="mb-4 text-[#5B3256]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Advanced Features
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-orange-50">
              <AccessibilityIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Accessibility
            </h1>
          </div>
          <p className="text-[#5B3256]/70">
            Trauma-aware experience with emergency support
          </p>
        </div>

        <div className="space-y-6">
          {/* Accessibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>
                Customize your HeartGuard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-blue-50 mt-1">
                    <Type className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#5B3256] mb-1">Large Type Mode</h3>
                    <p className="text-sm text-[#5B3256]/70">
                      Increase text size throughout the app for better readability
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.largeTypeMode}
                  onCheckedChange={() => handleToggleSetting('largeTypeMode')}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-purple-50 mt-1">
                    <Volume2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#5B3256] mb-1">Voice-Over Summaries</h3>
                    <p className="text-sm text-[#5B3256]/70">
                      Enable audio summaries of Trust Scores and risk insights
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.voiceOverSummaries}
                  onCheckedChange={() => handleToggleSetting('voiceOverSummaries')}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-pink-50 mt-1">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#5B3256] mb-1">Trauma-Aware Mode</h3>
                    <p className="text-sm text-[#5B3256]/70">
                      Use gentle language and avoid victim-blaming terminology
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.traumaAwareMode}
                  onCheckedChange={() => handleToggleSetting('traumaAwareMode')}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trauma-Aware Principles */}
          {settings.traumaAwareMode && (
            <Card className="border-pink-200 bg-pink-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Trauma-Aware Principles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-pink-900">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>We use gentle, supportive language throughout the app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>We avoid victim-blaming and judgmental terminology</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>We recognize that anyone can be targeted by scammers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>We provide clear paths to support resources when needed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Support Contacts</CardTitle>
              <CardDescription>
                24/7 helplines for immediate assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-sm text-red-800">
                  <p className="font-semibold mb-1">If you are in immediate danger, call 911</p>
                  <p>These resources are available 24/7 for support and guidance</p>
                </AlertDescription>
              </Alert>

              {emergencyContacts.length > 0 ? (
                <div className="space-y-3">
                  {emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E6B7BE]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#5B3256]">{contact.name}</h3>
                          <p className="text-sm text-[#5B3256]/70">Available 24/7</p>
                        </div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="px-4 py-2 bg-[#3C4B7C] text-white rounded-lg hover:bg-[#5B3256] transition-colors font-semibold"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5B3256]/70 text-center py-4">
                  Loading emergency contacts...
                </p>
              )}

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Additional Resources:</p>
                  <ul className="space-y-1">
                    <li>• National Suicide Prevention Lifeline: 988</li>
                    <li>• Crisis Text Line: Text HOME to 741741</li>
                    <li>• RAINN Sexual Assault Hotline: 1-800-656-4673</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Simplified Explanations */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding Trust Scores</CardTitle>
              <CardDescription>
                Simplified explanations of what Trust Scores mean
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold text-green-800">High Trust Score (70-100)</span>
                </div>
                <p className="text-sm text-green-700">This person seems safe based on the information analyzed.</p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚠️</span>
                  <span className="font-semibold text-yellow-800">Medium Trust Score (40-69)</span>
                </div>
                <p className="text-sm text-yellow-700">Be cautious. Some warning signs detected. Verify their identity before sharing personal information or money.</p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🚨</span>
                  <span className="font-semibold text-red-800">Low Trust Score (0-39)</span>
                </div>
                <p className="text-sm text-red-700">Be very careful with this person. Multiple red flags detected. Consider ending contact and seeking support.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
