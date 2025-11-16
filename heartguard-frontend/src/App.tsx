import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Shield, Upload, MessageSquare, AlertTriangle, CheckCircle, XCircle, Heart, TrendingUp, Globe, Download, ExternalLink, Users, Search, Archive, ChevronLeft, ChevronRight, Plus, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ScamHotspotMap } from '@/components/ScamHotspotMap'
import { SafetyReplyCard } from '@/components/SafetyReplyCard'

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

interface SafetyReply {
  id: number
  trigger_type: string
  risk_level: string
  reply_text: string
  context: string
  priority: number
}

interface PersonData {
  personKey: string
  displayName: string
  hint?: string
  archived: boolean
  createdAt: string
  updatedAt: string
  lastConversationId?: string
  conversationIds: string[]
  lastScore?: number
}

interface ConversationMetadata {
  personKey: string
  title: string
  createdAt: string
  updatedAt: string
  lastScore?: number
}

interface PeopleStorage {
  people: Record<string, PersonData>
  conversations: Record<string, ConversationMetadata>
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
  const [showHotspotMap, setShowHotspotMap] = useState(false)
  const [safetyReplies, setSafetyReplies] = useState<SafetyReply[]>([])
  const [reportHash, setReportHash] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [showScammerProfile, setShowScammerProfile] = useState(false)
  const [scammerName, setScammerName] = useState('')
  const [scammerPhone, setScammerPhone] = useState('')
  const [scammerEmail, setScammerEmail] = useState('')
  const [victimNarrative, setVictimNarrative] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const [peopleStorage, setPeopleStorage] = useState<PeopleStorage>({ people: {}, conversations: {} })
  const [currentPersonKey, setCurrentPersonKey] = useState<string | null>(null)
  const [newPersonName, setNewPersonName] = useState('')
  const [newPersonHint, setNewPersonHint] = useState('')
  const [isNewPerson, setIsNewPerson] = useState(true)
  const [continueSession, setContinueSession] = useState(false)
  const [showConversationList, setShowConversationList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [suspectedIPs, setSuspectedIPs] = useState('')
  const [ipIntelligence, setIpIntelligence] = useState<any[]>([])
  const [loadingIP, setLoadingIP] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('heartguard_people')
    if (stored) {
      try {
        setPeopleStorage(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load people storage:', e)
      }
    }
  }, [])

  const savePeopleStorage = (storage: PeopleStorage) => {
    setPeopleStorage(storage)
    localStorage.setItem('heartguard_people', JSON.stringify(storage))
  }

  const createPersonKey = (name: string, hint?: string): string => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const hintSlug = hint ? `-${hint.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''
    return `${slug}${hintSlug}`
  }

  const addOrUpdatePerson = (conversationId: string, score: number) => {
    const now = new Date().toISOString()
    const personName = newPersonName.trim() || scammerName.trim() || 'Unknown'
    const personKey = isNewPerson ? createPersonKey(personName, newPersonHint) : currentPersonKey!
    
    const updatedStorage = { ...peopleStorage }
    
    if (isNewPerson || !updatedStorage.people[personKey]) {
      updatedStorage.people[personKey] = {
        personKey,
        displayName: personName,
        hint: newPersonHint || undefined,
        archived: false,
        createdAt: now,
        updatedAt: now,
        lastConversationId: conversationId,
        conversationIds: [conversationId],
        lastScore: score
      }
    } else {
      const person = updatedStorage.people[personKey]
      person.updatedAt = now
      person.lastConversationId = conversationId
      person.lastScore = score
      if (!person.conversationIds.includes(conversationId)) {
        person.conversationIds.push(conversationId)
      }
    }
    
    updatedStorage.conversations[conversationId] = {
      personKey,
      title: `${personName} - ${new Date().toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      lastScore: score
    }
    
    savePeopleStorage(updatedStorage)
    setCurrentPersonKey(personKey)
  }

  const loadPerson = (personKey: string) => {
    const person = peopleStorage.people[personKey]
    if (person) {
      setCurrentPersonKey(personKey)
      setNewPersonName(person.displayName)
      setNewPersonHint(person.hint || '')
      setIsNewPerson(false)
      setContinueSession(true)
      setScammerName(person.displayName)
    }
  }

  const toggleArchivePerson = (personKey: string) => {
    const updatedStorage = { ...peopleStorage }
    if (updatedStorage.people[personKey]) {
      updatedStorage.people[personKey].archived = !updatedStorage.people[personKey].archived
      savePeopleStorage(updatedStorage)
    }
  }

  const getFilteredPeople = () => {
    return Object.values(peopleStorage.people)
      .filter(person => {
        if (!showArchived && person.archived) return false
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return person.displayName.toLowerCase().includes(query) || 
                 person.hint?.toLowerCase().includes(query)
        }
        return true
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const analyzeIPs = async () => {
    if (!suspectedIPs.trim()) return
    
    setLoadingIP(true)
    const ips = suspectedIPs.split(/[\s,]+/).filter(ip => ip.trim())
    const results = []
    
    for (const ip of ips) {
      try {
        const response = await fetch(`${API_URL}/ip/intel?ip=${encodeURIComponent(ip.trim())}`)
        if (response.ok) {
          const data = await response.json()
          results.push(data)
        }
      } catch (err) {
        console.error(`Failed to analyze IP ${ip}:`, err)
      }
    }
    
    setIpIntelligence(results)
    setLoadingIP(false)
  }

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
    
    if (isNewPerson && !newPersonName.trim() && !scammerName.trim()) {
      setError('Please enter a name for the person you\'re analyzing')
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
      
      const personName = newPersonName.trim() || scammerName.trim() || 'Unknown'
      
      if (personName || scammerPhone || scammerEmail || victimNarrative) {
        const scammerProfile = {
          claimed_name: personName,
          phone_numbers: scammerPhone ? [scammerPhone] : null,
          email_addresses: scammerEmail ? [scammerEmail] : null,
          victim_narrative: victimNarrative || null
        }
        formData.append('scammer_profile_json', JSON.stringify(scammerProfile))
      }
      
      if (continueSession && currentPersonKey && peopleStorage.people[currentPersonKey]?.lastConversationId) {
        formData.append('conversation_id', peopleStorage.people[currentPersonKey].lastConversationId!)
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
        addOrUpdatePerson(data.conversation_id, data.trust_score)
      }
      
      if (data.conversation_id) {
        try {
          const timelineResponse = await fetch(`${API_URL}/timeline/${data.conversation_id}`)
          if (timelineResponse.ok) {
            const timelineData = await timelineResponse.json()
            setTimeline(timelineData)
            
            const hasWalletFlags = timelineData.messages?.some((m: TimelineMessage) => m.wallet_watch_flag)
            const hasLargeTrustDrop = timelineData.messages?.some((m: TimelineMessage) => m.trust_score_delta < -20)
            const hasLargeToneShift = timelineData.messages?.some((m: TimelineMessage) => Math.abs(m.tone_shift_delta) > 20)
            
            if (hasWalletFlags || hasLargeTrustDrop || hasLargeToneShift || data.trust_score < 50) {
              const triggerType = hasWalletFlags ? 'wallet_watch' : hasLargeTrustDrop ? 'trust_drop' : hasLargeToneShift ? 'tone_shift' : 'general'
              const riskLevel = data.trust_score < 30 ? 'extreme' : 'high'
              
              try {
                const safetyResponse = await fetch(`${API_URL}/safety-replies?trigger_type=${triggerType}&risk_level=${riskLevel}`)
                if (safetyResponse.ok) {
                  const safetyData = await safetyResponse.json()
                  setSafetyReplies(safetyData.safety_replies || [])
                }
              } catch (err) {
                console.error('Failed to fetch safety replies:', err)
              }
            }
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

  const handleDownloadEvidenceReport = async () => {
    if (!report?.conversation_id) {
      setError('No conversation ID available for this report')
      return
    }

    setDownloadingPdf(true)
    try {
      const response = await fetch(`${API_URL}/evidence/generate/${report.conversation_id}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate evidence report')
      }

      const hash = response.headers.get('X-Report-Hash')
      if (hash) {
        setReportHash(hash)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `HeartGuard_Evidence_${report.conversation_id.substring(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download evidence report')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#5B3256] via-[#3C4B7C] to-[#E6B7BE] parallax-bg" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-[#E6B7BE] mr-3" />
            <h1 className="text-5xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>HeartGuard™</h1>
          </div>
          <p className="text-sm text-[#E6B7BE] italic mb-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Healing begins with truth.
          </p>
          <p className="text-xl text-[#F5E8DC] font-semibold mb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            Your heart deserves clarity, confidence, and care.
          </p>
          <p className="text-[#F5E8DC] text-lg opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            AI-powered emotional intelligence for safer online connections
          </p>
          {!report && !loading && (
            <div className="mt-6 flex gap-4 justify-center">
              <Button
                onClick={startDemoMode}
                className="bg-[#E6B7BE] hover:bg-[#E6B7BE]/90 text-[#5B3256] px-6 py-3 rounded-xl shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                <Heart className="mr-2" />
                Watch Cinematic Demo
              </Button>
              <Button
                onClick={() => setShowHotspotMap(!showHotspotMap)}
                className="bg-[#3C4B7C] hover:bg-[#3C4B7C]/90 text-white px-6 py-3 rounded-xl shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                <Globe className="mr-2" />
                {showHotspotMap ? 'Hide' : 'View'} Scam Hotspot Map™
              </Button>
            </div>
          )}
        </div>

        {/* Conversation Management Section */}
        {!report && !showHotspotMap && (
          <div className="mb-6 animate-fade-in">
            <Card className="bg-white/95 border-[#3C4B7C] border-2 rounded-xl shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                      <Users className="mr-2 text-[#3C4B7C]" />
                      Person You're Analyzing
                    </CardTitle>
                    <CardDescription className="text-[#5B3256]/70">
                      Keep conversations separate for each person (e.g., Larry, John)
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowConversationList(!showConversationList)}
                    variant="outline"
                    className="border-[#3C4B7C] text-[#3C4B7C]"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {showConversationList ? 'Hide' : 'View'} All People ({Object.keys(peopleStorage.people).length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New/Existing Person Toggle */}
                <div className="flex gap-2 p-1 bg-[#F5E8DC] rounded-xl">
                  <button
                    onClick={() => {
                      setIsNewPerson(true)
                      setCurrentPersonKey(null)
                      setNewPersonName('')
                      setNewPersonHint('')
                      setContinueSession(false)
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isNewPerson 
                        ? 'bg-[#3C4B7C] text-white shadow-md' 
                        : 'text-[#5B3256] hover:bg-white/50'
                    }`}
                  >
                    <Plus className="inline mr-2 h-4 w-4" />
                    New Person
                  </button>
                  <button
                    onClick={() => {
                      setIsNewPerson(false)
                      setContinueSession(true)
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      !isNewPerson 
                        ? 'bg-[#3C4B7C] text-white shadow-md' 
                        : 'text-[#5B3256] hover:bg-white/50'
                    }`}
                  >
                    <RotateCcw className="inline mr-2 h-4 w-4" />
                    Existing Person
                  </button>
                </div>

                {/* New Person Form */}
                {isNewPerson && (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                        Person's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newPersonName}
                        onChange={(e) => {
                          setNewPersonName(e.target.value)
                          setScammerName(e.target.value)
                        }}
                        placeholder="e.g., Larry, John"
                        className="w-full px-4 py-2 bg-[#F5E8DC] border-[#3C4B7C] border-2 rounded-xl text-[#5B3256] placeholder:text-[#5B3256]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                        Hint (Optional - helps avoid confusion)
                      </label>
                      <input
                        type="text"
                        value={newPersonHint}
                        onChange={(e) => setNewPersonHint(e.target.value)}
                        placeholder="e.g., Tinder, +234-xxx, Bumble"
                        className="w-full px-4 py-2 bg-[#F5E8DC] border-[#3C4B7C] border-2 rounded-xl text-[#5B3256] placeholder:text-[#5B3256]/50"
                      />
                      <p className="text-xs text-[#5B3256]/60 mt-1">
                        Add platform or phone last 4 digits to distinguish between multiple people with same name
                      </p>
                    </div>
                  </div>
                )}

                {/* Existing Person Selector */}
                {!isNewPerson && (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                        Select Person
                      </label>
                      <select
                        value={currentPersonKey || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            loadPerson(e.target.value)
                          }
                        }}
                        className="w-full px-4 py-2 bg-[#F5E8DC] border-[#3C4B7C] border-2 rounded-xl text-[#5B3256]"
                      >
                        <option value="">Choose a person...</option>
                        {getFilteredPeople().map(person => (
                          <option key={person.personKey} value={person.personKey}>
                            {person.displayName} {person.hint ? `(${person.hint})` : ''} - Score: {person.lastScore || 'N/A'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {currentPersonKey && (
                      <div className="flex gap-2 p-1 bg-[#F5E8DC] rounded-xl">
                        <button
                          onClick={() => setContinueSession(false)}
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                            !continueSession 
                              ? 'bg-[#E6B7BE] text-[#5B3256] shadow-md' 
                              : 'text-[#5B3256] hover:bg-white/50'
                          }`}
                        >
                          New Session
                        </button>
                        <button
                          onClick={() => setContinueSession(true)}
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                            continueSession 
                              ? 'bg-[#E6B7BE] text-[#5B3256] shadow-md' 
                              : 'text-[#5B3256] hover:bg-white/50'
                          }`}
                        >
                          Continue Last Session
                        </button>
                      </div>
                    )}
                    
                    {currentPersonKey && continueSession && (
                      <Alert className="bg-blue-50 border-blue-300">
                        <AlertDescription className="text-sm text-blue-900">
                          Paste only NEW messages to continue the conversation. Previous messages are already analyzed.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Conversation List Sidebar */}
                {showConversationList && (
                  <div className="border-t-2 border-[#E6B7BE] pt-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-[#5B3256]">All People</h3>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5B3256]/50" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="pl-9 pr-3 py-1 text-sm bg-[#F5E8DC] border-[#3C4B7C] border rounded-lg text-[#5B3256]"
                          />
                        </div>
                        <Button
                          onClick={() => setShowArchived(!showArchived)}
                          variant="outline"
                          size="sm"
                          className="border-[#5B3256] text-[#5B3256]"
                        >
                          <Archive className="mr-1 h-3 w-3" />
                          {showArchived ? 'Hide' : 'Show'} Archived
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getFilteredPeople().length === 0 ? (
                        <p className="text-center text-[#5B3256]/60 py-4">
                          {searchQuery ? 'No people found matching your search' : 'No people tracked yet'}
                        </p>
                      ) : (
                        getFilteredPeople().map(person => (
                          <div
                            key={person.personKey}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                              currentPersonKey === person.personKey
                                ? 'bg-[#3C4B7C]/10 border-[#3C4B7C]'
                                : 'bg-[#F5E8DC] border-[#E6B7BE] hover:border-[#3C4B7C]'
                            } ${person.archived ? 'opacity-60' : ''}`}
                            onClick={() => {
                              loadPerson(person.personKey)
                              setIsNewPerson(false)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#5B3256]">
                                    {person.displayName}
                                  </span>
                                  {person.hint && (
                                    <span className="text-xs text-[#5B3256]/60">
                                      ({person.hint})
                                    </span>
                                  )}
                                  {person.archived && (
                                    <Badge variant="outline" className="text-xs">
                                      Archived
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-[#5B3256]/70">
                                  <span>Score: {person.lastScore || 'N/A'}</span>
                                  <span>•</span>
                                  <span>{new Date(person.updatedAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>{person.conversationIds.length} session(s)</span>
                                </div>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleArchivePerson(person.personKey)
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-[#5B3256]"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scam Hotspot Map Section */}
        {showHotspotMap && !report && (
          <div className="mb-8 animate-fade-in">
            <ScamHotspotMap />
          </div>
        )}

        {!report && !showHotspotMap ? (
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

        {!report && !showHotspotMap && (
          <Card className="bg-white/95 border-[#5B3256] border-2 rounded-xl shadow-lg mb-6 animate-fade-in animate-delay-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                    <Shield className="mr-2 text-[#5B3256]" />
                    Scammer Profile (Optional)
                  </CardTitle>
                  <CardDescription className="text-[#5B3256]/70">
                    Add details for comprehensive Evidence Locker™ report
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowScammerProfile(!showScammerProfile)}
                  variant="outline"
                  className="border-[#5B3256] text-[#5B3256]"
                >
                  {showScammerProfile ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            {showScammerProfile && (
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                      Scammer's Name
                    </label>
                    <input
                      type="text"
                      value={scammerName}
                      onChange={(e) => setScammerName(e.target.value)}
                      placeholder="e.g., John Smith"
                      className="w-full px-4 py-2 bg-[#F5E8DC] border-[#E6B7BE] border-2 rounded-xl text-[#5B3256] placeholder:text-[#5B3256]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={scammerPhone}
                      onChange={(e) => setScammerPhone(e.target.value)}
                      placeholder="e.g., +234 123 456 7890"
                      className="w-full px-4 py-2 bg-[#F5E8DC] border-[#E6B7BE] border-2 rounded-xl text-[#5B3256] placeholder:text-[#5B3256]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={scammerEmail}
                    onChange={(e) => setScammerEmail(e.target.value)}
                    placeholder="e.g., scammer@example.com"
                    className="w-full px-4 py-2 bg-[#F5E8DC] border-[#E6B7BE] border-2 rounded-xl text-[#5B3256] placeholder:text-[#5B3256]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                    Suspected IP Addresses (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={suspectedIPs}
                      onChange={(e) => setSuspectedIPs(e.target.value)}
                      placeholder="e.g., 192.168.1.1, 8.8.8.8 (comma or space separated)"
                      className="flex-1 px-4 py-2 bg-[#F5E8DC] border-[#E6B7BE] border-2 rounded-xl text-[#5B3256] placeholder:text-[#5B3256]/50"
                    />
                    <Button
                      onClick={analyzeIPs}
                      disabled={loadingIP || !suspectedIPs.trim()}
                      className="bg-[#3C4B7C] hover:bg-[#3C4B7C]/90 text-white"
                    >
                      {loadingIP ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Check IPs'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-[#5B3256]/60 mt-1">
                    We'll check if they're using VPN, proxy, or Tor to hide their location
                  </p>
                </div>
                {ipIntelligence.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#5B3256]">IP Intelligence Results:</h4>
                    {ipIntelligence.map((intel, idx) => (
                      <Alert key={idx} className={`${
                        intel.risk_level === 'High' ? 'bg-red-50 border-red-300' :
                        intel.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-300' :
                        'bg-green-50 border-green-300'
                      }`}>
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#5B3256]">{intel.ip}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                intel.risk_level === 'High' ? 'bg-red-600 text-white' :
                                intel.risk_level === 'Medium' ? 'bg-yellow-600 text-white' :
                                'bg-green-600 text-white'
                              }`}>
                                {intel.risk_level} Risk
                              </span>
                            </div>
                            {intel.success ? (
                              <>
                                <div className="text-sm text-[#5B3256]">
                                  <strong>Location:</strong> {intel.city}, {intel.region}, {intel.country} ({intel.country_code})
                                </div>
                                <div className="text-sm text-[#5B3256]">
                                  <strong>ISP:</strong> {intel.isp || 'Unknown'}
                                </div>
                                {(intel.is_vpn || intel.is_proxy || intel.is_tor || intel.is_datacenter) && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {intel.is_vpn && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">🔒 VPN Detected</span>}
                                    {intel.is_proxy && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">🌐 Proxy Detected</span>}
                                    {intel.is_tor && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">🕵️ Tor Network</span>}
                                    {intel.is_datacenter && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">🖥️ Datacenter IP</span>}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-red-600">
                                {intel.message || 'Failed to analyze IP'}
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#5B3256] mb-2">
                    Your Statement (What Happened)
                  </label>
                  <Textarea
                    value={victimNarrative}
                    onChange={(e) => setVictimNarrative(e.target.value)}
                    placeholder="Describe what happened, how you met, financial losses, etc. This will be included in your legal evidence report."
                    className="min-h-32 bg-[#F5E8DC] border-[#E6B7BE] border-2 text-[#5B3256] placeholder:text-[#5B3256]/50 rounded-xl"
                  />
                </div>
                <Alert className="bg-blue-50 border-blue-300">
                  <AlertDescription className="text-sm text-blue-900">
                    This information will be included in your Evidence Locker™ PDF report for law enforcement and legal proceedings.
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        )}

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

            {report.conversation_id && (
              <Card className="bg-white/95 border-[#5B3256] border-2 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#5B3256] flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Evidence Locker™
                  </CardTitle>
                  <CardDescription>
                    Download a legal-grade PDF report with QR code verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleDownloadEvidenceReport}
                    disabled={downloadingPdf}
                    className="w-full bg-[#5B3256] hover:bg-[#5B3256]/90 text-white"
                  >
                    {downloadingPdf ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Evidence Report...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2" />
                        Download Evidence Report (PDF)
                      </>
                    )}
                  </Button>
                  
                  {reportHash && (
                    <Alert className="bg-green-50 border-green-300">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>Report Downloaded Successfully</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>Your evidence report includes a QR code for verification.</p>
                        <Button
                          onClick={() => window.open(`/verify?hash=${reportHash}`, '_blank')}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Verify Report Now
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {safetyReplies.length > 0 && (
              <SafetyReplyCard 
                replies={safetyReplies} 
                triggerType={safetyReplies[0]?.trigger_type || 'general'} 
              />
            )}

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
