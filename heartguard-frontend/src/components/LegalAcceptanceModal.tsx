import { useState } from 'react'
import { AlertTriangle, Shield, FileText, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LegalAcceptanceModalProps {
  onAccept: () => void
}

const TERMS_VERSION = '1.0'

export function LegalAcceptanceModal({ onAccept }: LegalAcceptanceModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [acknowledgedDisclaimer, setAcknowledgedDisclaimer] = useState(false)

  const canProceed = acceptedTerms && acceptedPrivacy && acknowledgedDisclaimer

  const handleAccept = () => {
    if (canProceed) {
      localStorage.setItem('heartguard_legal_accepted', 'true')
      localStorage.setItem('heartguard_terms_version', TERMS_VERSION)
      localStorage.setItem('heartguard_acceptance_date', new Date().toISOString())
      onAccept()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="bg-white max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#5B3256] to-[#3C4B7C] text-white">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-8 h-8" />
            Welcome to HeartGuard™
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[70vh] p-6 space-y-6">
          {/* Critical Disclaimer */}
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 text-lg mb-2">IMPORTANT LEGAL NOTICE</h3>
                <p className="text-red-800 text-sm leading-relaxed">
                  HeartGuard™ provides <strong>AI-powered analysis for informational purposes only</strong>. 
                  This is <strong>NOT legal, financial, medical, or professional advice</strong>. 
                  We are <strong>NOT a Consumer Reporting Agency</strong> and our service is <strong>NOT for employment, 
                  credit, housing, or insurance decisions</strong>. Results are <strong>NOT guaranteed to be accurate</strong>. 
                  Always verify information independently and consult appropriate professionals.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900 text-lg mb-2">EMERGENCY SITUATIONS</h3>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  <strong>IF YOU ARE IN IMMEDIATE DANGER, CALL 911 OR LOCAL EMERGENCY SERVICES IMMEDIATELY.</strong> 
                  HeartGuard™ is not an emergency service and cannot provide immediate assistance. 
                  For suspected crimes or fraud, contact law enforcement directly.
                </p>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#5B3256]" />
              <h3 className="font-bold text-[#5B3256] text-lg">Terms of Service</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-700 leading-relaxed">
              <p className="mb-2"><strong>Key Points:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Service provided "AS IS" without warranties</li>
                <li>Not for FCRA-regulated purposes (employment, credit, housing)</li>
                <li>Limited liability - not liable for indirect or consequential damages</li>
                <li>You must be 18+ years old to use this service</li>
                <li>Disputes resolved through binding arbitration</li>
                <li>No class action lawsuits</li>
                <li>You agree to indemnify HeartGuard™ from claims arising from your use</li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                <a href="/legal/terms-of-service" target="_blank" className="text-[#3C4B7C] underline hover:text-[#5B3256]">
                  Read Full Terms of Service →
                </a>
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#5B3256] border-gray-300 rounded focus:ring-[#5B3256]"
              />
              <span className="text-sm text-gray-700">
                I have read and agree to the <strong>Terms of Service</strong> (Version {TERMS_VERSION})
              </span>
            </label>
          </div>

          {/* Privacy Policy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#5B3256]" />
              <h3 className="font-bold text-[#5B3256] text-lg">Privacy Policy</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-700 leading-relaxed">
              <p className="mb-2"><strong>Key Points:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>We collect analysis inputs, usage data, and device information</li>
                <li>Data used to provide service and improve AI models</li>
                <li>Shared with service providers (hosting, AI processing)</li>
                <li>We do NOT sell your personal information</li>
                <li>You have rights to access, correct, and delete your data</li>
                <li>Data processed in the United States</li>
                <li>GDPR and CCPA rights available where applicable</li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                <a href="/legal/privacy-policy" target="_blank" className="text-[#3C4B7C] underline hover:text-[#5B3256]">
                  Read Full Privacy Policy →
                </a>
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#5B3256] border-gray-300 rounded focus:ring-[#5B3256]"
              />
              <span className="text-sm text-gray-700">
                I have read and acknowledge the <strong>Privacy Policy</strong>
              </span>
            </label>
          </div>

          {/* Final Acknowledgment */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedDisclaimer}
                onChange={(e) => setAcknowledgedDisclaimer(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#5B3256] border-gray-300 rounded focus:ring-[#5B3256]"
              />
              <span className="text-sm text-gray-700">
                <strong>I understand and acknowledge that:</strong>
                <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                  <li>HeartGuard™ is for informational purposes only</li>
                  <li>I will not rely solely on AI-generated assessments</li>
                  <li>I will seek professional advice when appropriate</li>
                  <li>I will contact law enforcement for suspected crimes</li>
                  <li>HeartGuard™ has limited liability as described in the Terms</li>
                </ul>
              </span>
            </label>
          </div>

          {/* Accept Button */}
          <div className="pt-4 border-t border-gray-300">
            <Button
              onClick={handleAccept}
              disabled={!canProceed}
              className={`w-full py-6 text-lg font-bold ${
                canProceed 
                  ? 'bg-[#5B3256] hover:bg-[#5B3256]/90 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canProceed ? (
                <>
                  <Shield className="mr-2" />
                  I Accept - Continue to HeartGuard™
                </>
              ) : (
                'Please accept all terms to continue'
              )}
            </Button>
            <p className="text-xs text-center text-gray-500 mt-3">
              By clicking "I Accept", you agree to be legally bound by these terms
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function checkLegalAcceptance(): boolean {
  const accepted = localStorage.getItem('heartguard_legal_accepted')
  const version = localStorage.getItem('heartguard_terms_version')
  
  return accepted === 'true' && version === TERMS_VERSION
}
