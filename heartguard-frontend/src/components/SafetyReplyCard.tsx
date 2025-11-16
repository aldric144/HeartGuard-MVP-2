import { Shield, Copy, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'

interface SafetyReply {
  id: number
  trigger_type: string
  risk_level: string
  reply_text: string
  context: string
  priority: number
}

interface SafetyReplyCardProps {
  replies: SafetyReply[]
  triggerType: string
}

export function SafetyReplyCard({ replies, triggerType }: SafetyReplyCardProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = async (reply: SafetyReply) => {
    try {
      await navigator.clipboard.writeText(reply.reply_text)
      setCopiedId(reply.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getTriggerTitle = (type: string) => {
    const titles: Record<string, string> = {
      wallet_watch: 'Financial Request Detected',
      trust_drop: 'Trust Score Drop Detected',
      tone_shift: 'Tone Shift Detected',
      general: 'Safety Suggestions'
    }
    return titles[type] || 'Safety Alert'
  }

  const getTriggerIcon = (type: string) => {
    return '🛡️'
  }

  if (!replies || replies.length === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-300 border-2 rounded-xl shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-900" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
          <Shield className="mr-2 text-orange-600 h-6 w-6" />
          {getTriggerIcon(triggerType)} {getTriggerTitle(triggerType)}
        </CardTitle>
        <CardDescription className="text-orange-800">
          We've detected a potential risk. Here are some safe responses you can use:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-orange-100 border-orange-400">
          <AlertDescription className="text-orange-900 font-semibold">
            ⚠️ Active Defense: Use these responses to protect yourself and de-escalate the situation.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {replies.map((reply, index) => (
            <div
              key={reply.id}
              className="bg-white p-4 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Option {index + 1}
                    </span>
                    {reply.risk_level === 'extreme' && (
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 font-medium leading-relaxed">
                    "{reply.reply_text}"
                  </p>
                </div>
                <Button
                  onClick={() => handleCopy(reply)}
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-orange-300 hover:bg-orange-50"
                >
                  {copiedId === reply.id ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>💡 Pro Tip:</strong> Click the copy button to quickly paste these responses into your conversation. 
            These suggestions are designed to help you maintain boundaries and protect yourself from potential scams.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
