import { useState } from 'react'
import { Globe, AlertTriangle, Shield, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://heartguard-backend.onrender.com'

export function CommunityIntelligence() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'report' | 'check'>('check')
  
  const [reportForm, setReportForm] = useState({
    photoHash: '',
    phoneNumber: '',
    email: '',
    socialHandles: '',
    description: ''
  })
  const [reportResult, setReportResult] = useState<any>(null)
  const [reportLoading, setReportLoading] = useState(false)
  
  const [checkForm, setCheckForm] = useState({
    photoHash: '',
    phoneNumber: '',
    email: '',
    socialHandles: ''
  })
  const [checkResult, setCheckResult] = useState<any>(null)
  const [checkLoading, setCheckLoading] = useState(false)

  const handleReport = async () => {
    setReportLoading(true)
    setReportResult(null)
    
    try {
      const formData = new FormData()
      formData.append('user_id', '1') // TODO: Get from auth context
      if (reportForm.photoHash) formData.append('photo_hash', reportForm.photoHash)
      if (reportForm.phoneNumber) formData.append('phone_number', reportForm.phoneNumber)
      if (reportForm.email) formData.append('email', reportForm.email)
      if (reportForm.socialHandles) formData.append('social_handles', reportForm.socialHandles)
      if (reportForm.description) formData.append('description', reportForm.description)
      
      const response = await fetch(`${API_URL}/api/community/report`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setReportResult(data)
    } catch (error) {
      setReportResult({ success: false, error: 'Failed to submit report' })
    } finally {
      setReportLoading(false)
    }
  }

  const handleCheck = async () => {
    setCheckLoading(true)
    setCheckResult(null)
    
    try {
      const params = new URLSearchParams()
      if (checkForm.photoHash) params.append('photo_hash', checkForm.photoHash)
      if (checkForm.phoneNumber) params.append('phone_number', checkForm.phoneNumber)
      if (checkForm.email) params.append('email', checkForm.email)
      if (checkForm.socialHandles) params.append('social_handles', checkForm.socialHandles)
      
      const response = await fetch(`${API_URL}/api/community/check?${params.toString()}`)
      const data = await response.json()
      setCheckResult(data)
    } catch (error) {
      setCheckResult({ error: 'Failed to check community intelligence' })
    } finally {
      setCheckLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
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
            <div className="p-3 rounded-lg bg-blue-50">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Community Intelligence
            </h1>
          </div>
          <p className="text-[#5B3256]/70">
            Privacy-preserving scammer detection network
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'check' ? 'default' : 'outline'}
            onClick={() => setActiveTab('check')}
            className="flex-1"
          >
            <Shield className="w-4 h-4 mr-2" />
            Check Identifier
          </Button>
          <Button
            variant={activeTab === 'report' ? 'default' : 'outline'}
            onClick={() => setActiveTab('report')}
            className="flex-1"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Scammer
          </Button>
        </div>

        {activeTab === 'check' && (
          <Card>
            <CardHeader>
              <CardTitle>Check Community Reports</CardTitle>
              <CardDescription>
                Check if an identifier has been reported by the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Photo Hash (optional)
                </label>
                <Input
                  placeholder="Enter photo hash"
                  value={checkForm.photoHash}
                  onChange={(e) => setCheckForm({ ...checkForm, photoHash: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Phone Number (optional)
                </label>
                <Input
                  placeholder="Enter phone number"
                  value={checkForm.phoneNumber}
                  onChange={(e) => setCheckForm({ ...checkForm, phoneNumber: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={checkForm.email}
                  onChange={(e) => setCheckForm({ ...checkForm, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Social Handles (optional)
                </label>
                <Input
                  placeholder="Enter social media handles"
                  value={checkForm.socialHandles}
                  onChange={(e) => setCheckForm({ ...checkForm, socialHandles: e.target.value })}
                />
              </div>

              <Button
                onClick={handleCheck}
                disabled={checkLoading || (!checkForm.photoHash && !checkForm.phoneNumber && !checkForm.email && !checkForm.socialHandles)}
                className="w-full"
              >
                {checkLoading ? 'Checking...' : 'Check Community Intelligence'}
              </Button>

              {checkResult && (
                <Alert className={checkResult.seen_before ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                  <AlertDescription>
                    {checkResult.error ? (
                      <p className="text-red-600">{checkResult.error}</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#5B3256]">Status:</span>
                          <span className={checkResult.seen_before ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                            {checkResult.seen_before ? '⚠️ Found in Community Reports' : '✓ Not Found in Reports'}
                          </span>
                        </div>
                        
                        {checkResult.seen_before && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#5B3256]">Report Count:</span>
                              <span className="font-semibold">{checkResult.report_count}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#5B3256]">Risk Level:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(checkResult.risk_level)}`}>
                                {checkResult.risk_level.toUpperCase()}
                              </span>
                            </div>
                            
                            {checkResult.identifiers_found && checkResult.identifiers_found.length > 0 && (
                              <div>
                                <span className="font-semibold text-[#5B3256] block mb-2">Identifiers Found:</span>
                                <ul className="list-disc list-inside space-y-1">
                                  {checkResult.identifiers_found.map((id: any, idx: number) => (
                                    <li key={idx} className="text-sm">
                                      {id.type}: {id.value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'report' && (
          <Card>
            <CardHeader>
              <CardTitle>Report a Scammer</CardTitle>
              <CardDescription>
                Help protect the community by reporting suspected scammers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm text-blue-800">
                  Your report is anonymized and stored using privacy-preserving techniques (Bloom filters + hashed identifiers)
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Photo Hash (optional)
                </label>
                <Input
                  placeholder="Enter photo hash"
                  value={reportForm.photoHash}
                  onChange={(e) => setReportForm({ ...reportForm, photoHash: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Phone Number (optional)
                </label>
                <Input
                  placeholder="Enter phone number"
                  value={reportForm.phoneNumber}
                  onChange={(e) => setReportForm({ ...reportForm, phoneNumber: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={reportForm.email}
                  onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Social Handles (optional)
                </label>
                <Input
                  placeholder="Enter social media handles"
                  value={reportForm.socialHandles}
                  onChange={(e) => setReportForm({ ...reportForm, socialHandles: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Description
                </label>
                <Textarea
                  placeholder="Describe the scam or suspicious behavior"
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleReport}
                disabled={reportLoading || (!reportForm.photoHash && !reportForm.phoneNumber && !reportForm.email && !reportForm.socialHandles)}
                className="w-full"
              >
                {reportLoading ? 'Submitting...' : 'Submit Report'}
              </Button>

              {reportResult && (
                <Alert className={reportResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription>
                    {reportResult.success ? (
                      <div className="space-y-2">
                        <p className="text-green-600 font-semibold">✓ {reportResult.message}</p>
                        <p className="text-sm text-green-700">{reportResult.privacy_note}</p>
                      </div>
                    ) : (
                      <p className="text-red-600">{reportResult.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
