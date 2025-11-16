import { useState } from 'react'
import { Shield, CheckCircle, XCircle, Search, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface VerificationResult {
  valid: boolean
  message: string
  report_metadata?: {
    conversation_id: string
    generated_at: string
    total_messages: number
    final_trust_score: number
    app_version: string
    backend_version: string
  }
}

export function Verify() {
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!hash.trim()) {
      setError('Please enter a report hash to verify')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/evidence/verify?hash=${encodeURIComponent(hash.trim())}`)
      
      if (!response.ok) {
        throw new Error('Failed to verify report')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification')
    } finally {
      setLoading(false)
    }
  }

  const handleHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHash(e.target.value)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5B3256] via-[#3C4B7C] to-[#E6B7BE]" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-[#E6B7BE] mr-3" />
            <h1 className="text-5xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
              Evidence Verification
            </h1>
          </div>
          <p className="text-xl text-[#F5E8DC] font-semibold mb-2">
            Verify the authenticity of HeartGuard™ Evidence Reports
          </p>
          <p className="text-[#F5E8DC] text-lg opacity-90">
            Enter the SHA-256 hash from your report to confirm it hasn't been tampered with
          </p>
        </div>

        <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
              <Search className="mr-2 text-[#E6B7BE]" />
              Report Hash Verification
            </CardTitle>
            <CardDescription className="text-[#5B3256]/70">
              Enter the complete SHA-256 hash from your Evidence Locker™ report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter SHA-256 hash (128 characters)..."
                  value={hash}
                  onChange={handleHashChange}
                  className="flex-1 bg-[#F5E8DC] border-[#E6B7BE] text-[#5B3256] placeholder:text-[#5B3256]/50 rounded-xl font-mono text-sm"
                  maxLength={128}
                />
                <Button
                  onClick={handleVerify}
                  disabled={loading || !hash.trim()}
                  className="bg-[#5B3256] hover:bg-[#5B3256]/90 text-white px-6 rounded-xl"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-[#5B3256]/60">
                The hash can be found in your PDF report's Chain of Custody section or by scanning the QR code
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-300 animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Error</AlertTitle>
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className={`border-4 animate-fade-in ${result.valid ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                {result.valid ? (
                  <>
                    <CheckCircle className="mr-3 h-8 w-8 text-green-600" />
                    <span className="text-green-900">Report Verified ✓</span>
                  </>
                ) : (
                  <>
                    <XCircle className="mr-3 h-8 w-8 text-red-600" />
                    <span className="text-red-900">Verification Failed</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={result.valid ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}>
                <AlertDescription className={result.valid ? 'text-green-900 font-semibold' : 'text-red-900 font-semibold'}>
                  {result.message}
                </AlertDescription>
              </Alert>

              {result.valid && result.report_metadata && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Report Metadata</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Conversation ID</p>
                      <p className="font-mono text-xs text-gray-900 break-all">{result.report_metadata.conversation_id}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Generated At</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(result.report_metadata.generated_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{result.report_metadata.total_messages}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Final Trust Score</p>
                      <p className="text-2xl font-bold text-gray-900">{result.report_metadata.final_trust_score}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">App Version</p>
                      <p className="font-semibold text-gray-900">v{result.report_metadata.app_version}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Backend Version</p>
                      <p className="font-semibold text-gray-900">v{result.report_metadata.backend_version}</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>✓ Integrity Confirmed:</strong> This report's data has not been modified since generation. 
                      The SHA-256 hash matches our records, confirming the evidence is authentic and admissible.
                    </p>
                  </div>
                </div>
              )}

              {!result.valid && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>⚠ What this means:</strong> The hash you entered doesn't match any reports in our database. 
                    This could mean the report was not generated by HeartGuard™, the hash was entered incorrectly, 
                    or the report data has been tampered with.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-[#F5E8DC] hover:text-white underline"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            ← Back to HeartGuard™
          </a>
        </div>
      </div>
    </div>
  )
}
