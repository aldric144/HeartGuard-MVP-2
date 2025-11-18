import { useState } from 'react'
import { Shield, AlertTriangle, ArrowLeft, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://heartguard-backend.onrender.com'

export function WalletWatchPlus() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'screen' | 'analyze'>('screen')
  
  const [screenForm, setScreenForm] = useState({
    address: '',
    currency: 'bitcoin'
  })
  const [screenResult, setScreenResult] = useState<any>(null)
  const [screenLoading, setScreenLoading] = useState(false)
  
  const [analyzeForm, setAnalyzeForm] = useState({
    amount: '',
    currency: 'bitcoin',
    recipientAddress: '',
    relationshipDays: '',
    context: ''
  })
  const [analyzeResult, setAnalyzeResult] = useState<any>(null)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)

  const handleScreen = async () => {
    setScreenLoading(true)
    setScreenResult(null)
    
    try {
      const formData = new FormData()
      formData.append('address', screenForm.address)
      formData.append('currency', screenForm.currency)
      
      const response = await fetch(`${API_URL}/api/crypto/screen`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setScreenResult(data)
    } catch (error) {
      setScreenResult({ error: 'Failed to screen address' })
    } finally {
      setScreenLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzeLoading(true)
    setAnalyzeResult(null)
    
    try {
      const formData = new FormData()
      formData.append('amount', analyzeForm.amount)
      formData.append('currency', analyzeForm.currency)
      formData.append('recipient_address', analyzeForm.recipientAddress)
      formData.append('relationship_duration_days', analyzeForm.relationshipDays)
      formData.append('context', analyzeForm.context)
      
      const response = await fetch(`${API_URL}/api/crypto/analyze`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setAnalyzeResult(data)
    } catch (error) {
      setAnalyzeResult({ error: 'Failed to analyze transaction' })
    } finally {
      setAnalyzeLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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
            <div className="p-3 rounded-lg bg-green-50">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              WalletWatch™ Plus
            </h1>
          </div>
          <p className="text-[#5B3256]/70">
            Cryptocurrency address screening and transaction analysis
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'screen' ? 'default' : 'outline'}
            onClick={() => setActiveTab('screen')}
            className="flex-1"
          >
            <Shield className="w-4 h-4 mr-2" />
            Screen Address
          </Button>
          <Button
            variant={activeTab === 'analyze' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analyze')}
            className="flex-1"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Analyze Transaction
          </Button>
        </div>

        {activeTab === 'screen' && (
          <Card>
            <CardHeader>
              <CardTitle>Screen Crypto Address</CardTitle>
              <CardDescription>
                Check if a cryptocurrency address is flagged as a known scam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Cryptocurrency
                </label>
                <Select value={screenForm.currency} onValueChange={(value) => setScreenForm({ ...screenForm, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="tether">Tether (USDT)</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Wallet Address
                </label>
                <Input
                  placeholder="Enter cryptocurrency address"
                  value={screenForm.address}
                  onChange={(e) => setScreenForm({ ...screenForm, address: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleScreen}
                disabled={screenLoading || !screenForm.address}
                className="w-full"
              >
                {screenLoading ? 'Screening...' : 'Screen Address'}
              </Button>

              {screenResult && (
                <Alert className={screenResult.valid ? (screenResult.is_scam ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50') : 'border-yellow-200 bg-yellow-50'}>
                  <AlertDescription>
                    {screenResult.error ? (
                      <p className="text-yellow-600 font-semibold">{screenResult.error}</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#5B3256]">Valid Address:</span>
                          <span className={screenResult.valid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {screenResult.valid ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                        
                        {screenResult.valid && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#5B3256]">Risk Level:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(screenResult.risk_level)}`}>
                                {screenResult.risk_level.toUpperCase()}
                              </span>
                            </div>
                            
                            {screenResult.is_scam && (
                              <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                                <p className="text-red-800 font-semibold mb-1">{screenResult.warning}</p>
                                <p className="text-sm text-red-700">{screenResult.recommendation}</p>
                                {screenResult.source && (
                                  <p className="text-xs text-red-600 mt-2">Source: {screenResult.source}</p>
                                )}
                              </div>
                            )}
                            
                            {!screenResult.is_scam && screenResult.warnings && screenResult.warnings.length > 0 && (
                              <div>
                                <span className="font-semibold text-[#5B3256] block mb-2">Warnings:</span>
                                <ul className="list-disc list-inside space-y-1">
                                  {screenResult.warnings.map((warning: string, idx: number) => (
                                    <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-800">{screenResult.recommendation}</p>
                              {screenResult.note && (
                                <p className="text-xs text-blue-600 mt-2">{screenResult.note}</p>
                              )}
                            </div>
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

        {activeTab === 'analyze' && (
          <Card>
            <CardHeader>
              <CardTitle>Analyze Crypto Transaction</CardTitle>
              <CardDescription>
                Analyze a proposed cryptocurrency transaction for red flags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={analyzeForm.amount}
                    onChange={(e) => setAnalyzeForm({ ...analyzeForm, amount: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                    Cryptocurrency
                  </label>
                  <Select value={analyzeForm.currency} onValueChange={(value) => setAnalyzeForm({ ...analyzeForm, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin">Bitcoin</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="tether">Tether (USDT)</SelectItem>
                      <SelectItem value="usdc">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Recipient Wallet Address
                </label>
                <Input
                  placeholder="Enter recipient's cryptocurrency address"
                  value={analyzeForm.recipientAddress}
                  onChange={(e) => setAnalyzeForm({ ...analyzeForm, recipientAddress: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Relationship Duration (days)
                </label>
                <Input
                  type="number"
                  placeholder="How many days have you known this person?"
                  value={analyzeForm.relationshipDays}
                  onChange={(e) => setAnalyzeForm({ ...analyzeForm, relationshipDays: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Transaction Context
                </label>
                <Textarea
                  placeholder="Why are you sending this cryptocurrency? (e.g., investment, emergency, gift)"
                  value={analyzeForm.context}
                  onChange={(e) => setAnalyzeForm({ ...analyzeForm, context: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzeLoading || !analyzeForm.amount || !analyzeForm.recipientAddress || !analyzeForm.relationshipDays || !analyzeForm.context}
                className="w-full"
              >
                {analyzeLoading ? 'Analyzing...' : 'Analyze Transaction'}
              </Button>

              {analyzeResult && (
                <div className="space-y-4">
                  {analyzeResult.error ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription>
                        <p className="text-red-600">{analyzeResult.error}</p>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert className={`border-2 ${getRiskColor(analyzeResult.risk_level)}`}>
                        <AlertDescription>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#5B3256]">Risk Level:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(analyzeResult.risk_level)}`}>
                                {analyzeResult.risk_level.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#5B3256]">Risk Score:</span>
                              <span className="font-semibold">{analyzeResult.risk_score}</span>
                            </div>
                            
                            <div className="p-3 bg-white/50 rounded-lg border">
                              <p className="font-semibold text-[#5B3256] mb-2">Recommendation:</p>
                              <p className="text-sm">{analyzeResult.recommendation}</p>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                      
                      {analyzeResult.red_flags && analyzeResult.red_flags.length > 0 && (
                        <Card className="border-red-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              Red Flags Detected
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analyzeResult.red_flags.map((flag: string, idx: number) => (
                                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                  <span className="mt-1">•</span>
                                  <span>{flag}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                      
                      {analyzeResult.safety_tips && analyzeResult.safety_tips.length > 0 && (
                        <Card className="border-blue-200 bg-blue-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Shield className="w-5 h-5 text-blue-600" />
                              Safety Tips
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analyzeResult.safety_tips.map((tip: string, idx: number) => (
                                <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                  <span className="mt-1">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
