import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Shield, Upload, MessageSquare, AlertTriangle, CheckCircle, XCircle, Heart, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ManipulationPattern {
  pattern_type: string
  severity: string
  evidence: string
  timestamp?: string
}

interface PhotoAnalysis {
  image_hash: string
  reverse_image_matches: number
  deepfake_confidence: string
  metadata_issues: string[]
  risk_level: string
}

interface ChatAnalysis {
  sentiment_drift: Array<{ message_index: number; polarity: number; subjectivity: number }>
  manipulation_patterns: ManipulationPattern[]
  emotional_manipulation_index: number
  risk_level: string
}

interface TrustScoreReport {
  report_id: string
  trust_score: number
  confidence_level: string
  color_band: string
  top_risk_insights: string[]
  photo_analysis?: PhotoAnalysis
  chat_analysis?: ChatAnalysis
  created_at: string
  conversation_id?: string
}

interface TimelineMessage {
  message_index: number
  message_text: string
  timestamp: string
  trust_score_delta: number
  tone_shift_delta: number
  wallet_watch_flag: boolean
  risk_rationale: string
}

interface TimelineData {
  conversation_id: string
  final_trust_score: number
  start_date: string
  last_updated: string
  message_count: number
  messages: TimelineMessage[]
}

interface PatternAnalytics {
  total_conversations: number
  high_risk_conversations: number
  average_trust_score: number
  most_common_patterns: Array<{ pattern: string; count: number }>
  financial_request_stats: {
    total_financial_requests: number
    conversations_with_financial_requests: number
    average_message_index: number
    percentage_of_conversations: number
  }
  average_message_count: number
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [chatMessages, setChatMessages] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<TrustScoreReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [analytics, setAnalytics] = useState<PatternAnalytics | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (report) {
      playChime()
      
      const duration = 1800 // 1.8 seconds
      const steps = 60
      const increment = report.trust_score / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= report.trust_score) {
          setAnimatedScore(report.trust_score)
          clearInterval(timer)
        } else {
          setAnimatedScore(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    } else {
      setAnimatedScore(0)
    }
  }, [report])

  const playChime = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 523.25
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const startDemoMode = async () => {
    setDemoMode(true)
    setError(null)
    setReport(null)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const demoMessages = `Hi there, how are you?
You are my soulmate!
I need money urgently for hospital bills.
Please send me $500 right now via crypto!`
    
    setChatMessages(demoMessages)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('chat_messages', demoMessages)
      
      const response = await fetch(`${API_URL}/trustscore/generate`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate trust score')
      }
      
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      setDemoMode(false)
    }
  }

  const highlightFinancialTerms = (text: string) => {
    const financialKeywords = ['money', 'crypto', 'bitcoin', 'gift card', 'wire', 'transfer', 'payment', 'cash', '$', '€', '£']
    let highlightedText = text
    
    financialKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<span class="bg-red-200 text-red-900 px-1 rounded">$1</span>')
    })
    
    return highlightedText
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile && !chatMessages.trim()) {
      setError('Please upload a photo or enter chat messages to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const formData = new FormData()
      if (selectedFile) {
        formData.append('photo_file', selectedFile)
      }
      if (chatMessages.trim()) {
        formData.append('chat_messages', chatMessages)
      }

      const response = await fetch(`${API_URL}/trustscore/generate`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate trust score')
      }

      const data = await response.json()
      setReport(data)
      
      if (data.conversation_id) {
        try {
          const timelineResponse = await fetch(`${API_URL}/timeline/${data.conversation_id}`)
          if (timelineResponse.ok) {
            const timelineData = await timelineResponse.json()
            setTimeline(timelineData)
          }
        } catch (err) {
          console.error('Failed to fetch timeline:', err)
        }
      }
      
      try {
        const analyticsResponse = await fetch(`${API_URL}/analytics/patterns`)
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#3C4B7C]'
    if (score >= 40) return 'text-[#E6B7BE]'
    return 'text-[#5B3256]'
  }

  const getTrustScoreBg = (score: number) => {
    if (score >= 70) return 'bg-[#F5E8DC] border-[#3C4B7C]'
    if (score >= 40) return 'bg-[#F5E8DC] border-[#E6B7BE]'
    return 'bg-[#F5E8DC] border-[#5B3256]'
  }

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      Critical: 'bg-red-600 text-white',
      High: 'bg-orange-600 text-white',
      Medium: 'bg-yellow-600 text-white',
      Low: 'bg-blue-600 text-white',
    }
    return colors[severity] || 'bg-gray-600 text-white'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5B3256] via-[#3C4B7C] to-[#E6B7BE] parallax-bg" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-[#E6B7BE] mr-3" />
            <h1 className="text-5xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>HeartGuard™</h1>
          </div>
          <p className="text-sm text-[#E6B7BE] italic mb-3" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Healing begins with truth.
          </p>
          <p className="text-xl text-[#F5E8DC] font-semibold mb-2">
            Your heart deserves clarity, confidence, and care.
          </p>
          <p className="text-[#F5E8DC] text-lg opacity-90">
            AI-powered emotional intelligence for safer online connections
          </p>
          {!report && !loading && (
            <div className="mt-6">
              <Button
                onClick={startDemoMode}
                className="bg-[#E6B7BE] hover:bg-[#E6B7BE]/90 text-[#5B3256] px-6 py-3 rounded-xl shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                <Heart className="mr-2" />
                Watch Cinematic Demo
              </Button>
            </div>
          )}
        </div>

        {!report ? (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                  <Upload className="mr-2 text-[#E6B7BE]" />
                  Photo Analysis
                </CardTitle>
                <CardDescription className="text-[#5B3256]/70">
                  Upload a profile photo for verification and authenticity check
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-[#E6B7BE] rounded-xl p-6 text-center bg-[#F5E8DC]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-[#E6B7BE]" size={48} />
                      <p className="text-[#5B3256] font-semibold">
                        {selectedFile ? selectedFile.name : 'Click to upload photo'}
                      </p>
                      <p className="text-[#5B3256]/60 text-sm mt-1">
                        JPG, PNG, or WEBP (max 10MB)
                      </p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg animate-fade-in animate-delay-100">
              <CardHeader>
                <CardTitle className="flex items-center text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                  <MessageSquare className="mr-2 text-[#E6B7BE]" />
                  ToneShift™ Chat Analysis
                </CardTitle>
                <CardDescription className="text-[#5B3256]/70">
                  Paste conversation messages to identify concerning patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste chat messages here (one per line)...&#10;&#10;Example:&#10;Hi, how are you?&#10;You are my soulmate!&#10;I need money urgently..."
                  value={chatMessages}
                  onChange={(e) => setChatMessages(e.target.value)}
                  className="min-h-48 bg-[#F5E8DC] border-[#E6B7BE] text-[#5B3256] placeholder:text-[#5B3256]/50 rounded-xl"
                />
              </CardContent>
            </Card>
          </div>
        ) : null}

        {error && (
          <Alert className="mb-6 bg-red-900 border-red-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!report && (
          <div className="text-center">
            <Button
              onClick={handleAnalyze}
              disabled={loading || (!selectedFile && !chatMessages.trim())}
              className={`bg-[#5B3256] hover:bg-[#5B3256]/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg ${!loading && (selectedFile || chatMessages.trim()) ? 'animate-indigo-pulse' : ''}`}
              size="lg"
              style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Your Connection...
                </>
              ) : (
                <>
                  <Shield className="mr-2" />
                  Generate Trust Score
                </>
              )}
            </Button>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            <Card className={`border-4 ${getTrustScoreBg(report.trust_score)}`}>
              <CardHeader>
                <CardTitle className="text-center text-3xl">Trust Score Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-8xl font-bold ${getTrustScoreColor(report.trust_score)} mb-2 animate-count-up`}>
                    {animatedScore}
                  </div>
                  <div className="text-2xl font-semibold text-gray-700 mb-4">
                    Confidence: {report.confidence_level}
                  </div>
                  <Progress value={animatedScore} className="h-4 mb-4" />
                  <div className="flex justify-center gap-2">
                    {report.trust_score >= 70 ? (
                      <Badge className="bg-[#3C4B7C] text-white text-lg px-4 py-2 rounded-xl">
                        <CheckCircle className="mr-2" />
                        Trustworthy Connection
                      </Badge>
                    ) : report.trust_score >= 40 ? (
                      <Badge className="bg-[#E6B7BE] text-[#5B3256] text-lg px-4 py-2 rounded-xl">
                        <AlertTriangle className="mr-2" />
                        Proceed with Caution
                      </Badge>
                    ) : (
                      <Badge className="bg-[#5B3256] text-white text-lg px-4 py-2 rounded-xl">
                        <XCircle className="mr-2" />
                        High Risk Detected
                      </Badge>
                    )}
                  </div>
                </div>

                {report.top_risk_insights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3 flex items-center">
                      <AlertTriangle className="mr-2 text-red-600" />
                      Top Risk Insights
                    </h3>
                    <div className="space-y-2">
                      {report.top_risk_insights.map((insight, idx) => (
                        <Alert key={idx} className="bg-red-50 border-red-300">
                          <AlertDescription className="font-semibold">{insight}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {report.photo_analysis && (
              <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>Photo Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <p className="text-[#5B3256]/70 text-sm">Reverse Image Matches</p>
                      <p className="text-2xl font-bold text-[#5B3256]">
                        {report.photo_analysis.reverse_image_matches}
                      </p>
                    </div>
                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <p className="text-[#5B3256]/70 text-sm">Deepfake Confidence</p>
                      <p className="text-2xl font-bold text-[#5B3256]">
                        {report.photo_analysis.deepfake_confidence}
                      </p>
                    </div>
                  </div>
                  {report.photo_analysis.metadata_issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[#5B3256]">Metadata Issues:</h4>
                      <ul className="list-disc list-inside space-y-1 text-[#5B3256]/80">
                        {report.photo_analysis.metadata_issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {report.chat_analysis && (
              <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>ToneShift™ Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-[#F5E8DC] p-4 rounded-xl">
                    <p className="text-[#5B3256]/70 text-sm">Emotional Manipulation Index</p>
                    <p className="text-3xl font-bold text-[#5B3256]">
                      {(report.chat_analysis.emotional_manipulation_index * 100).toFixed(1)}%
                    </p>
                    <Progress
                      value={report.chat_analysis.emotional_manipulation_index * 100}
                      className="h-2 mt-2"
                    />
                  </div>

                  {report.chat_analysis.sentiment_drift && report.chat_analysis.sentiment_drift.length > 0 && (
                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <h4 className="font-semibold mb-3 text-[#5B3256] text-lg flex items-center">
                        <TrendingUp className="mr-2" />
                        ToneShift™ Emotional Drift Chart
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={report.chat_analysis.sentiment_drift.map((point, idx) => ({
                          message: `Msg ${idx + 1}`,
                          sentiment: point.polarity,
                          subjectivity: point.subjectivity
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6B7BE" />
                          <XAxis dataKey="message" stroke="#5B3256" />
                          <YAxis stroke="#5B3256" domain={[-1, 1]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#F5E8DC', 
                              border: '2px solid #E6B7BE',
                              borderRadius: '12px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="sentiment" 
                            stroke="#5B3256" 
                            strokeWidth={3}
                            dot={{ fill: '#5B3256', r: 5 }}
                            name="Sentiment"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="subjectivity" 
                            stroke="#3C4B7C" 
                            strokeWidth={2}
                            dot={{ fill: '#3C4B7C', r: 4 }}
                            name="Subjectivity"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-[#5B3256]/60 mt-2 text-center">
                        Tracks emotional tone changes across conversation messages
                      </p>
                    </div>
                  )}

                  {report.chat_analysis.manipulation_patterns.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-[#5B3256] text-lg">
                        Concerning Patterns Identified:
                      </h4>
                      <div className="space-y-3">
                        {report.chat_analysis.manipulation_patterns.map((pattern, idx) => (
                          <div key={idx} className="bg-[#F5E8DC] p-4 rounded-xl border-l-4 border-[#5B3256]">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-bold text-[#5B3256]">{pattern.pattern_type}</h5>
                              <Badge className={getSeverityBadge(pattern.severity)}>
                                {pattern.severity}
                              </Badge>
                            </div>
                            <p className="text-[#5B3256]/80 text-sm">{pattern.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {timeline && timeline.messages.length > 0 && (
              <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#5B3256] flex items-center justify-between" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                    <span className="flex items-center">
                      <TrendingUp className="mr-2" />
                      Trust Timeline™ - Risk Evolution
                    </span>
                    <Button
                      onClick={() => setShowTimeline(!showTimeline)}
                      variant="outline"
                      className="border-[#5B3256] text-[#5B3256]"
                    >
                      {showTimeline ? 'Hide' : 'Show'} Timeline
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    See how the Trust Score changed with each message
                  </CardDescription>
                </CardHeader>
                {showTimeline && (
                  <CardContent className="space-y-6">
                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <h4 className="font-semibold mb-3 text-[#5B3256] text-lg">Trust Score Evolution</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={timeline.messages.map((msg, idx) => {
                          let cumulativeScore = 82
                          for (let i = 0; i <= idx; i++) {
                            cumulativeScore += timeline.messages[i].trust_score_delta
                          }
                          return {
                            message: `Msg ${msg.message_index}`,
                            score: cumulativeScore,
                            delta: msg.trust_score_delta
                          }
                        })}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6B7BE" />
                          <XAxis dataKey="message" stroke="#5B3256" />
                          <YAxis stroke="#5B3256" domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#F5E8DC', 
                              border: '2px solid #E6B7BE',
                              borderRadius: '12px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#5B3256" 
                            strokeWidth={3}
                            dot={{ fill: '#5B3256', r: 6 }}
                            name="Trust Score"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-[#5B3256]/60 mt-2 text-center">
                        Shows how Trust Score changed after each message was analyzed
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-[#5B3256] text-lg">Per-Message Risk Analysis</h4>
                      <div className="space-y-3">
                        {timeline.messages.map((msg) => (
                          <div 
                            key={msg.message_index} 
                            className={`p-4 rounded-xl border-l-4 ${
                              msg.wallet_watch_flag 
                                ? 'bg-red-50 border-red-500' 
                                : msg.trust_score_delta < -10 
                                  ? 'bg-orange-50 border-orange-500'
                                  : 'bg-[#F5E8DC] border-[#3C4B7C]'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-[#5B3256]">Message {msg.message_index}</span>
                                  {msg.wallet_watch_flag && (
                                    <Badge className="bg-red-600 text-white">
                                      💰 Financial Request
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-[#5B3256]/80 italic mb-2">"{msg.message_text}"</p>
                              </div>
                              <div className="text-right ml-4">
                                <div className={`text-2xl font-bold ${
                                  msg.trust_score_delta < 0 ? 'text-red-600' : 
                                  msg.trust_score_delta > 0 ? 'text-green-600' : 
                                  'text-gray-600'
                                }`}>
                                  {msg.trust_score_delta > 0 ? '+' : ''}{msg.trust_score_delta}
                                </div>
                                <div className="text-xs text-[#5B3256]/60">Score Change</div>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-[#5B3256]/20">
                              <p className="text-sm text-[#5B3256]">
                                <strong>Risk Detected:</strong> {msg.risk_rationale}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <h4 className="font-semibold mb-2 text-[#5B3256]">Timeline Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#5B3256]/70">Total Messages</p>
                          <p className="text-xl font-bold text-[#5B3256]">{timeline.message_count}</p>
                        </div>
                        <div>
                          <p className="text-[#5B3256]/70">Final Trust Score</p>
                          <p className="text-xl font-bold text-[#5B3256]">{timeline.final_trust_score}</p>
                        </div>
                        <div>
                          <p className="text-[#5B3256]/70">Financial Requests</p>
                          <p className="text-xl font-bold text-red-600">
                            {timeline.messages.filter(m => m.wallet_watch_flag).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#5B3256]/70">Biggest Drop</p>
                          <p className="text-xl font-bold text-red-600">
                            {Math.min(...timeline.messages.map(m => m.trust_score_delta))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {analytics && (
              <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                    Pattern Analytics - Insights Across All Conversations
                  </CardTitle>
                  <CardDescription>
                    Learn from patterns detected across {analytics.total_conversations} analyzed conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <p className="text-[#5B3256]/70 text-sm">Total Conversations</p>
                      <p className="text-3xl font-bold text-[#5B3256]">{analytics.total_conversations}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl">
                      <p className="text-red-700/70 text-sm">High Risk Detected</p>
                      <p className="text-3xl font-bold text-red-600">{analytics.high_risk_conversations}</p>
                    </div>
                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <p className="text-[#5B3256]/70 text-sm">Average Trust Score</p>
                      <p className="text-3xl font-bold text-[#5B3256]">{analytics.average_trust_score}</p>
                    </div>
                  </div>

                  {analytics.most_common_patterns.length > 0 && (
                    <div className="bg-[#F5E8DC] p-4 rounded-xl">
                      <h4 className="font-semibold mb-3 text-[#5B3256] text-lg">Most Common Scam Patterns</h4>
                      <div className="space-y-2">
                        {analytics.most_common_patterns.slice(0, 5).map((pattern, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-[#5B3256]">{pattern.pattern}</span>
                            <Badge className="bg-[#5B3256] text-white">{pattern.count} times</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                    <h4 className="font-semibold mb-3 text-red-700 text-lg flex items-center">
                      <AlertTriangle className="mr-2" />
                      Financial Request Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-red-700/70">Total Requests</p>
                        <p className="text-2xl font-bold text-red-600">
                          {analytics.financial_request_stats.total_financial_requests}
                        </p>
                      </div>
                      <div>
                        <p className="text-red-700/70">Conversations Affected</p>
                        <p className="text-2xl font-bold text-red-600">
                          {analytics.financial_request_stats.percentage_of_conversations}%
                        </p>
                      </div>
                      <div>
                        <p className="text-red-700/70">Avg Message Index</p>
                        <p className="text-2xl font-bold text-red-600">
                          Message {analytics.financial_request_stats.average_message_index}
                        </p>
                      </div>
                      <div>
                        <p className="text-red-700/70">Avg Messages/Convo</p>
                        <p className="text-2xl font-bold text-red-600">
                          {analytics.average_message_count}
                        </p>
                      </div>
                    </div>
                    <Alert className="mt-4 bg-red-100 border-red-300">
                      <AlertDescription className="text-red-800 text-sm">
                        <strong>Pattern Insight:</strong> Financial requests typically appear around message {analytics.financial_request_stats.average_message_index}, 
                        affecting {analytics.financial_request_stats.percentage_of_conversations}% of analyzed conversations.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button
                onClick={() => {
                  setReport(null)
                  setSelectedFile(null)
                  setChatMessages('')
                  setError(null)
                  setTimeline(null)
                  setAnalytics(null)
                  setShowTimeline(false)
                }}
                className="bg-[#3C4B7C] hover:bg-[#3C4B7C]/90 text-white px-8 py-4 text-lg rounded-xl shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                Analyze Another Connection
              </Button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-[#F5E8DC] text-sm">
          <p className="mb-2">
            <strong className="text-white">Note:</strong> This is a proof-of-concept demo using
            in-memory storage. Data will be lost when the server restarts.
          </p>
          <p className="opacity-90">HeartGuard™ - Empowering safer connections through compassionate AI</p>
        </div>
      </div>
    </div>
  )
}

export default App
