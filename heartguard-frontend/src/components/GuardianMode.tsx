import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Bell, Trash2, Mail, Phone, Shield, AlertTriangle, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface TrustedContact {
  id: number
  contact_name: string
  contact_email: string
  contact_phone: string | null
  alert_threshold: number
  is_active: boolean
  last_alert_timestamp: string | null
  created_at: string
}

interface AlertLog {
  id: number
  contact_name: string
  contact_email: string | null
  trust_score: number
  threshold: number
  channel: string
  reason: string
  status: string
  created_at: string
}

interface GuardianModeProps {
  conversationId?: string
  onClose?: () => void
}

export function GuardianMode({ conversationId, onClose }: GuardianModeProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'alerts'>('contacts')
  const [contacts, setContacts] = useState<TrustedContact[]>([])
  const [alerts, setAlerts] = useState<AlertLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactThreshold, setNewContactThreshold] = useState(40)

  const fetchContacts = async () => {
    const identifier = conversationId || 'global'
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/guardian/contacts/${identifier}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      } else {
        throw new Error('Failed to fetch contacts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    const identifier = conversationId || 'global'
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/guardian/alerts/${identifier}`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      } else {
        throw new Error('Failed to fetch alerts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async () => {
    if (!newContactName || !newContactEmail) {
      setError('Please fill in contact name and email')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/guardian/contact/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_identifier: conversationId || 'global',
          contact_name: newContactName,
          contact_email: newContactEmail,
          contact_phone: newContactPhone || null,
          alert_threshold: newContactThreshold
        }),
      })

      if (response.ok) {
        setNewContactName('')
        setNewContactEmail('')
        setNewContactPhone('')
        setNewContactThreshold(40)
        setShowAddContact(false)
        fetchContacts()
      } else {
        throw new Error('Failed to add contact')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to remove this trusted contact?')) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/guardian/contact/${contactId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchContacts()
      } else {
        throw new Error('Failed to delete contact')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts()
    } else {
      fetchAlerts()
    }
  }, [activeTab, conversationId])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-white/95 border-[#3C4B7C] border-2 rounded-xl shadow-2xl my-8">
        <CardHeader className="border-b border-[#E6B7BE]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#3C4B7C]" />
              <div>
                <CardTitle className="text-2xl text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                  Guardian Mode™
                </CardTitle>
                <CardDescription className="text-[#5B3256]/70">
                  FamilyLink™ - Protect your loved ones with smart alerts
                </CardDescription>
                <div className="bg-[#F5E8DC] p-3 rounded-lg mt-3">
                  <p className="text-xs text-[#5B3256] font-semibold mb-1">
                    📊 Trust Score Guide:
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-blue-600 font-semibold">70-100: Low Risk (Safe)</span>
                    <span className="text-orange-600 font-semibold">40-69: Medium Risk (Caution)</span>
                    <span className="text-red-600 font-semibold">0-39: High Risk (Danger!)</span>
                  </div>
                </div>
              </div>
            </div>
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-[#5B3256] hover:bg-[#E6B7BE]/20"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 ${
                activeTab === 'contacts'
                  ? 'bg-[#3C4B7C] text-white'
                  : 'bg-white text-[#5B3256] border border-[#3C4B7C]'
              }`}
              style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Trusted Contacts ({contacts.length})
            </Button>
            <Button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 ${
                activeTab === 'alerts'
                  ? 'bg-[#3C4B7C] text-white'
                  : 'bg-white text-[#5B3256] border border-[#3C4B7C]'
              }`}
              style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
            >
              <Bell className="w-4 h-4 mr-2" />
              Alert History ({alerts.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {!showAddContact && (
                <Button
                  onClick={() => setShowAddContact(true)}
                  className="w-full bg-[#E6B7BE] hover:bg-[#E6B7BE]/90 text-[#5B3256]"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Trusted Contact
                </Button>
              )}

              {showAddContact && (
                <Card className="bg-[#F5E8DC] border-[#3C4B7C]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#5B3256]">Add New Trusted Contact</CardTitle>
                    <CardDescription>They'll be alerted when trust score drops below threshold</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="Mom, Dad, Sister, etc."
                        className="w-full px-4 py-2 border border-[#3C4B7C] rounded-lg focus:ring-2 focus:ring-[#3C4B7C] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5B3256]/50" />
                        <input
                          type="email"
                          value={newContactEmail}
                          onChange={(e) => setNewContactEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-4 py-2 border border-[#3C4B7C] rounded-lg focus:ring-2 focus:ring-[#3C4B7C] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5B3256]/50" />
                        <input
                          type="tel"
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full pl-10 pr-4 py-2 border border-[#3C4B7C] rounded-lg focus:ring-2 focus:ring-[#3C4B7C] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                        Minimum Safe Score: {newContactThreshold}
                      </label>
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={newContactThreshold}
                          onChange={(e) => setNewContactThreshold(parseInt(e.target.value))}
                          className="w-full h-8 appearance-none bg-transparent cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, 
                              #dc2626 0%, #dc2626 39%, 
                              #f59e0b 40%, #f59e0b 69%, 
                              #3b82f6 70%, #3b82f6 100%)`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-2 mb-1">
                        <span className="text-red-600 font-semibold">0 High Risk</span>
                        <span className="text-orange-600 font-semibold">40 Medium</span>
                        <span className="text-blue-600 font-semibold">70 Low Risk</span>
                      </div>
                      <div className="bg-[#F5E8DC] p-3 rounded-lg mt-2">
                        <p className="text-xs text-[#5B3256] font-semibold mb-1">
                          ⚠️ You'll be alerted when trust score drops below {newContactThreshold}
                        </p>
                        <p className="text-xs text-[#5B3256]/70">
                          Lower score = Higher risk. Score below {newContactThreshold} means entering the danger zone!
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddContact}
                        disabled={loading}
                        className="flex-1 bg-[#3C4B7C] hover:bg-[#3C4B7C]/90 text-white"
                      >
                        {loading ? 'Adding...' : 'Add Contact'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddContact(false)
                          setNewContactName('')
                          setNewContactEmail('')
                          setNewContactPhone('')
                          setNewContactThreshold(40)
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading && !showAddContact && (
                <div className="text-center py-8 text-[#5B3256]">Loading contacts...</div>
              )}

              {!loading && contacts.length === 0 && !showAddContact && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-[#E6B7BE] mx-auto mb-4" />
                  <p className="text-[#5B3256] text-lg font-semibold mb-2">No Trusted Contacts Yet</p>
                  <p className="text-[#5B3256]/70">Add family members or friends to receive alerts</p>
                </div>
              )}

              {!loading && contacts.length > 0 && (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <Card key={contact.id} className="bg-white border-[#E6B7BE]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-[#5B3256]">{contact.contact_name}</h3>
                              <Badge className="bg-[#3C4B7C] text-white">
                                Min Safe Score: {contact.alert_threshold}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#5B3256]/60 mb-2">
                              Alerts when score drops below {contact.alert_threshold} (high risk)
                            </p>
                            <div className="space-y-1 text-sm text-[#5B3256]/70">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a 
                                  href={`mailto:${contact.contact_email}`}
                                  className="text-[#3C4B7C] hover:underline"
                                >
                                  {contact.contact_email}
                                </a>
                              </div>
                              {contact.contact_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <a 
                                    href={`tel:${contact.contact_phone}`}
                                    className="text-[#3C4B7C] hover:underline"
                                  >
                                    {contact.contact_phone}
                                  </a>
                                </div>
                              )}
                              {contact.last_alert_timestamp && (
                                <div className="text-xs text-[#5B3256]/50 mt-2">
                                  Last alert: {new Date(contact.last_alert_timestamp).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDeleteContact(contact.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-8 text-[#5B3256]">Loading alert history...</div>
              )}

              {!loading && alerts.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-[#E6B7BE] mx-auto mb-4" />
                  <p className="text-[#5B3256] text-lg font-semibold mb-2">No Alerts Yet</p>
                  <p className="text-[#5B3256]/70">Alerts will appear here when trust scores drop</p>
                </div>
              )}

              {!loading && alerts.length > 0 && (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="bg-white border-[#E6B7BE]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-bold text-[#5B3256]">{alert.contact_name}</h3>
                          </div>
                          <Badge className={`${
                            alert.trust_score < 30 ? 'bg-red-600' :
                            alert.trust_score < 50 ? 'bg-orange-600' :
                            'bg-yellow-600'
                          } text-white`}>
                            Score: {alert.trust_score}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-[#5B3256] font-semibold">{alert.reason}</p>
                          <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                            <p className="text-xs text-red-800 font-semibold">
                              ⚠️ Trust Score {alert.trust_score} {'<'} Minimum Safe Score {alert.threshold}
                            </p>
                            <p className="text-xs text-red-700">
                              {alert.trust_score < 30 ? 'HIGH RISK - Immediate attention needed!' :
                               alert.trust_score < 50 ? 'MEDIUM-HIGH RISK - Exercise caution' :
                               'MEDIUM RISK - Monitor closely'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-[#5B3256]/70 mt-2">
                            <span>Channel: {alert.channel}</span>
                            <span>Status: {alert.status}</span>
                          </div>
                          <p className="text-xs text-[#5B3256]/50 mt-2">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
