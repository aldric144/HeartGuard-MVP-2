import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, Search, MapPin, AlertTriangle, Shield, Info, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface LocationRiskData {
  is_known_scam_origin: boolean
  location_risk_score: number
  risk_rationale: string
  matched_code?: string
  region?: string
  risk_level?: string
}

interface RegionData {
  name: string
  codes: string[]
  risk_level: 'Extreme' | 'High' | 'Medium'
  color: string
  position: { x: number; y: number }
}

const HOTSPOT_REGIONS: RegionData[] = [
  { name: 'West Africa', codes: ['+234', '+233', '+225'], risk_level: 'Extreme', color: '#DC2626', position: { x: 48, y: 52 } },
  { name: 'East Africa', codes: ['+254', '+27'], risk_level: 'Extreme', color: '#DC2626', position: { x: 55, y: 55 } },
  
  { name: 'Southeast Asia', codes: ['+63', '+60', '+66', '+84', '+62'], risk_level: 'Extreme', color: '#DC2626', position: { x: 75, y: 52 } },
  { name: 'South Asia', codes: ['+91', '+92', '+880'], risk_level: 'High', color: '#EA580C', position: { x: 68, y: 50 } },
  { name: 'East Asia', codes: ['+86', '+852'], risk_level: 'High', color: '#EA580C', position: { x: 78, y: 45 } },
  
  { name: 'Eastern Europe', codes: ['+380', '+7', '+40'], risk_level: 'High', color: '#EA580C', position: { x: 52, y: 38 } },
  
  { name: 'Middle East', codes: ['+971', '+90', '+20'], risk_level: 'High', color: '#EA580C', position: { x: 58, y: 48 } },
  
  { name: 'Caribbean', codes: ['+1-876', '+1-658', '+1-473', '+1-809'], risk_level: 'Extreme', color: '#DC2626', position: { x: 25, y: 50 } },
  
  { name: 'Latin America', codes: ['+55', '+52', '+57'], risk_level: 'Medium', color: '#CA8A04', position: { x: 22, y: 60 } },
  
  { name: 'US Spoofed Codes', codes: ['+1-646', '+1-347', '+1-702'], risk_level: 'Medium', color: '#CA8A04', position: { x: 18, y: 42 } },
]

export function ScamHotspotMap() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LocationRiskData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [focusedRegion, setFocusedRegion] = useState<RegionData | null>(null)
  const [animatedCounters, setAnimatedCounters] = useState({ extreme: 0, high: 0, total: 0 })
  const [showResult, setShowResult] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({
    extreme: false,
    high: false,
    total: false
  })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    setMapVisible(true)
    
    const extremeCount = HOTSPOT_REGIONS.filter(r => r.risk_level === 'Extreme').length
    const highCount = HOTSPOT_REGIONS.reduce((acc, r) => acc + r.codes.length, 0)
    const totalCount = HOTSPOT_REGIONS.length

    const duration = 1500
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      setAnimatedCounters({
        extreme: Math.floor(extremeCount * progress),
        high: Math.floor(highCount * progress),
        total: Math.floor(totalCount * progress)
      })
      if (step >= steps) clearInterval(timer)
    }, interval)

    if (!prefersReducedMotion) {
      setTimeout(() => startMapTour(), 800)
    }

    return () => clearInterval(timer)
  }, [prefersReducedMotion])

  const startMapTour = () => {
    setTourActive(true)
    const tourRegions = [
      HOTSPOT_REGIONS.find(r => r.name === 'West Africa'),
      HOTSPOT_REGIONS.find(r => r.name === 'Caribbean'),
      HOTSPOT_REGIONS.find(r => r.name === 'Southeast Asia'),
      HOTSPOT_REGIONS.find(r => r.name === 'East Asia')
    ].filter(Boolean) as RegionData[]

    let currentIndex = 0
    const tourInterval = setInterval(() => {
      if (currentIndex < tourRegions.length) {
        setFocusedRegion(tourRegions[currentIndex])
        setSelectedRegion(tourRegions[currentIndex])
        currentIndex++
      } else {
        clearInterval(tourInterval)
        setFocusedRegion(null)
        setTourActive(false)
      }
    }, 2000)
  }

  const checkPhoneNumber = async (codeToCheck?: string) => {
    const code = codeToCheck || phoneNumber
    if (!code.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setShowResult(false)

    try {
      const response = await fetch(`${API_URL}/analyze/location/${encodeURIComponent(code)}`)
      if (!response.ok) throw new Error('Failed to check phone number')
      const data = await response.json()
      setResult(data)
      setTimeout(() => setShowResult(true), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const quickCheck = (code: string) => {
    setPhoneNumber(code)
    checkPhoneNumber(code)
  }

  const handleRegionClick = (region: RegionData) => {
    setTourActive(false)
    setSelectedRegion(region)
    setFocusedRegion(region)
    setShowDetailPanel(true)
    setPhoneNumber(region.codes[0])
    checkPhoneNumber(region.codes[0])
  }

  const handleRegionKeyPress = (e: React.KeyboardEvent, region: RegionData) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRegionClick(region)
    }
  }

  const closeDetailPanel = () => {
    setShowDetailPanel(false)
    setFocusedRegion(null)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Extreme': return '#DC2626'
      case 'High': return '#EA580C'
      case 'Medium': return '#CA8A04'
      default: return '#16A34A'
    }
  }

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Extreme': return 'bg-red-600 text-white'
      case 'High': return 'bg-orange-600 text-white'
      case 'Medium': return 'bg-yellow-600 text-white'
      default: return 'bg-green-600 text-white'
    }
  }

  const toggleCard = (cardKey: string) => {
    setFlippedCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }))
  }

  return (
    <div className="space-y-6">
      {/* Main Card with Map and Checker Side by Side */}
      <Card className="bg-white/95 border-[#E6B7BE] border-2 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
            <Globe className="mr-2 text-[#E6B7BE]" />
            Scam Hotspot Map™
          </CardTitle>
          <CardDescription className="text-[#5B3256]/70">
            Global romance fraud intelligence - 72 high-risk regions monitored
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Interactive World Map */}
            <div>
              <div className="relative bg-gradient-to-br from-[#F6EAF1] to-[#E6B7BE]/20 rounded-xl p-4 mb-3 shadow-inner overflow-hidden">
                <svg 
                  viewBox="0 0 100 70" 
                  className={`w-full h-auto transition-all duration-1000 ease-out ${mapVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{
                    transform: focusedRegion ? `scale(1.4) translate(${(50 - focusedRegion.position.x) * 0.5}px, ${(35 - focusedRegion.position.y) * 0.5}px)` : 'scale(1)'
                  }}
                >
                  <defs>
                    <radialGradient id="focusGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#E6B7BE" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#E6B7BE" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <rect x="0" y="0" width="100" height="70" fill="#F6EAF1" opacity="0.6" />
                  
                  <g className={`transition-all duration-1000 ${mapVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                    <path d="M 8 30 L 12 25 L 18 22 L 24 24 L 28 28 L 30 35 L 28 42 L 24 48 L 20 50 L 15 48 L 12 45 L 10 40 L 8 35 Z" fill="#9AA5B1" stroke="#334155" strokeWidth="0.4" opacity="0.85" />
                    <path d="M 24 52 L 28 50 L 32 52 L 34 58 L 32 65 L 28 68 L 24 66 L 22 60 L 23 54 Z" fill="#9AA5B1" stroke="#334155" strokeWidth="0.4" opacity="0.85" />
                    <path d="M 45 28 L 50 25 L 56 26 L 60 30 L 58 35 L 54 38 L 48 36 L 45 32 Z" fill="#9AA5B1" stroke="#334155" strokeWidth="0.4" opacity="0.85" />
                    <path d="M 46 40 L 50 38 L 56 40 L 58 45 L 58 52 L 56 60 L 52 66 L 48 64 L 46 58 L 44 50 L 45 44 Z" fill="#9AA5B1" stroke="#334155" strokeWidth="0.4" opacity="0.85" />
                    <path d="M 62 28 L 68 24 L 75 26 L 82 30 L 88 35 L 90 42 L 88 48 L 82 52 L 76 54 L 70 52 L 65 48 L 62 42 L 60 35 Z" fill="#9AA5B1" stroke="#334155" strokeWidth="0.4" opacity="0.85" />
                    <path d="M 78 58 L 84 56 L 88 58 L 90 62 L 88 66 L 82 68 L 78 66 L 76 62 Z" fill="#9AA5B1" stroke="#334155" strokeWidth="0.4" opacity="0.85" />
                  </g>
                  
                  {HOTSPOT_REGIONS.map((region, idx) => (
                    <g 
                      key={idx}
                      onMouseEnter={() => !tourActive && setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => !tourActive && handleRegionClick(region)}
                      onKeyDown={(e) => !tourActive && handleRegionKeyPress(e, region)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${region.name}, ${region.risk_level} risk, tap to view details`}
                      className={`cursor-pointer transition-all duration-500 ${mapVisible ? 'opacity-100' : 'opacity-0'} focus:outline-none`}
                      style={{ transitionDelay: `${400 + idx * 100}ms` }}
                    >
                      <circle
                        cx={region.position.x}
                        cy={region.position.y}
                        r="10"
                        fill="transparent"
                        pointerEvents="all"
                        className="cursor-pointer"
                      />
                      {focusedRegion?.name === region.name && (
                        <>
                          <circle
                            cx={region.position.x}
                            cy={region.position.y}
                            r="15"
                            fill="url(#focusGlow)"
                            className="animate-pulse"
                            style={{ animationDuration: '1.5s' }}
                          />
                          <circle
                            cx={region.position.x}
                            cy={region.position.y}
                            r="12"
                            fill="none"
                            stroke={region.color}
                            strokeWidth="1"
                            opacity="0.4"
                            className="animate-ping"
                            style={{ animationDuration: '1.2s' }}
                          />
                        </>
                      )}
                      <circle
                        cx={region.position.x}
                        cy={region.position.y}
                        r={hoveredRegion?.name === region.name || focusedRegion?.name === region.name ? "3.5" : "2.5"}
                        fill={region.color}
                        opacity="0.95"
                        filter={(hoveredRegion?.name === region.name || focusedRegion?.name === region.name) ? "url(#glow)" : undefined}
                        className="transition-all duration-500"
                      />
                      <circle
                        cx={region.position.x}
                        cy={region.position.y}
                        r="7"
                        fill={region.color}
                        opacity="0.2"
                        className="animate-ping"
                        style={{ animationDuration: '3s' }}
                      />
                      {(hoveredRegion?.name === region.name || focusedRegion?.name === region.name) && (
                        <>
                          <circle
                            cx={region.position.x}
                            cy={region.position.y}
                            r="9"
                            fill="none"
                            stroke={region.color}
                            strokeWidth="0.8"
                            opacity="0.5"
                            className="animate-ping"
                            style={{ animationDuration: '1.5s' }}
                          />
                          <circle
                            cx={region.position.x}
                            cy={region.position.y}
                            r="11"
                            fill="none"
                            stroke={region.color}
                            strokeWidth="0.6"
                            opacity="0.3"
                            className="animate-ping"
                            style={{ animationDuration: '2s' }}
                          />
                        </>
                      )}
                      <text
                        x={region.position.x}
                        y={region.position.y - 5}
                        fontSize={hoveredRegion?.name === region.name || focusedRegion?.name === region.name ? "3.2" : "2.5"}
                        fill="#0F172A"
                        textAnchor="middle"
                        className="pointer-events-none font-bold transition-all duration-500"
                        style={{ textShadow: '0 0 4px white, 0 0 3px white, 0 0 2px white' }}
                      >
                        {region.name}
                      </text>
                    </g>
                  ))}
                </svg>

                {tourActive && (
                  <div className="absolute top-2 right-2 bg-[#5B3256] text-white px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                    🌍 Map Tour Active
                  </div>
                )}
                
                {!tourActive && (
                  <button
                    onClick={startMapTour}
                    className="absolute top-2 right-2 bg-[#E6B7BE] hover:bg-[#E6B7BE]/80 text-[#5B3256] px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105"
                  >
                    ▶️ Replay Tour
                  </button>
                )}

                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                    <span className="text-xs text-[#5B3256]">Extreme</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                    <span className="text-xs text-[#5B3256]">High</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-600"></div>
                    <span className="text-xs text-[#5B3256]">Medium</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Number Origin Finder */}
            <div>
              <div className="mb-3">
                <h3 className="flex items-center text-[#5B3256] font-semibold mb-2" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                  <Search className="mr-2 h-5 w-5 text-[#E6B7BE]" />
                  Number Origin Finder
                </h3>
                <p className="text-sm text-[#5B3256]/70 mb-2">
                  Check any phone number or country code for fraud risk
                </p>
                <p className="text-xs text-[#5B3256] font-medium mb-3 bg-[#F5E8DC] p-2 rounded">
                  💡 Full number not required. Try <span className="font-bold">+234</span> or <span className="font-bold">+1-876</span>
                </p>
                <div className="space-y-3">
                  {/* Quick test chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      onClick={() => quickCheck('+234')}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-red-600 text-red-600 hover:bg-red-50"
                    >
                      +234 Nigeria
                    </Button>
                    <Button
                      onClick={() => quickCheck('+1-876')}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-red-600 text-red-600 hover:bg-red-50"
                    >
                      +1-876 Jamaica
                    </Button>
                    <Button
                      onClick={() => quickCheck('+63')}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-red-600 text-red-600 hover:bg-red-50"
                    >
                      +63 Philippines
                    </Button>
                    <Button
                      onClick={() => quickCheck('+86')}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      +86 China
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g., +234, +1-876, or full number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && checkPhoneNumber()}
                      className="bg-[#F5E8DC] border-[#E6B7BE] text-[#5B3256] placeholder:text-[#5B3256]/50 text-sm"
                    />
                    <Button
                      onClick={() => checkPhoneNumber()}
                      disabled={loading || !phoneNumber.trim()}
                      className="bg-[#5B3256] hover:bg-[#5B3256]/90 text-white"
                      size="sm"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  {error && (
                    <Alert className="bg-red-900 border-red-600 py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-white text-xs">{error}</AlertDescription>
                    </Alert>
                  )}

                  {result && (
                    <div 
                      className={`p-3 rounded-xl border-2 transition-all duration-500 ${
                        showResult ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      } ${result.is_known_scam_origin ? 'bg-red-50 border-red-600' : 'bg-green-50 border-green-600'}`}
                    >
                      <div className="flex items-start gap-2">
                        {result.is_known_scam_origin ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-2" style={{ color: result.is_known_scam_origin ? '#DC2626' : '#16A34A' }}>
                            {result.is_known_scam_origin ? 'High-Risk Origin' : 'No Known Risk'}
                          </div>
                          
                          {result.matched_code && (
                            <div className="space-y-1.5 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">Code:</span>
                                <Badge className={`${getRiskBadgeClass(result.risk_level || 'Medium')} text-xs`}>
                                  {result.matched_code}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">Region:</span>
                                <span className="text-xs text-gray-900">{result.region}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">Risk:</span>
                                <Badge className={`${getRiskBadgeClass(result.risk_level || 'Medium')} text-xs`}>
                                  {result.risk_level}
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-700 mb-2">
                            {result.risk_rationale}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700">Score:</span>
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all duration-1000 ease-out"
                                  style={{
                                    width: showResult ? `${result.location_risk_score}%` : '0%',
                                    backgroundColor: getRiskColor(result.risk_level || 'Medium')
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold tabular-nums" style={{ color: getRiskColor(result.risk_level || 'Medium') }}>
                                {result.location_risk_score}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats with Animated Counters - Flippable Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Extreme Risk Card */}
        <div 
          className="relative h-32 cursor-pointer group"
          onClick={() => toggleCard('extreme')}
          style={{ perspective: '1000px' }}
        >
          <div 
            className={`relative w-full h-full transition-transform duration-700 ${flippedCards.extreme ? '[transform:rotateY(180deg)]' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <Card className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 text-white border-0 shadow-lg group-hover:shadow-2xl transition-shadow duration-300" style={{ backfaceVisibility: 'hidden' }}>
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                <div className="text-4xl font-bold mb-1 tabular-nums">{animatedCounters.extreme}</div>
                <div className="text-sm opacity-90">Extreme Risk Regions</div>
                <div className="text-xs opacity-70 mt-2">Click to learn more</div>
              </CardContent>
            </Card>
            {/* Back */}
            <Card className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-800 text-white border-0 shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <CardContent className="pt-4 px-4 pb-4 h-full flex flex-col justify-between text-xs">
                <div>
                  <div className="font-bold mb-1.5 text-sm">⚠️ Extreme Risk Zones</div>
                  <p className="leading-tight mb-2">These regions have the highest concentration of romance scam operations. Scammers often use fake profiles claiming to be from these areas.</p>
                </div>
                <div className="bg-red-900/50 p-2 rounded text-xs italic">
                  💡 "If it seems too perfect, verify before you trust."
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* High Risk Codes Card */}
        <div 
          className="relative h-32 cursor-pointer group"
          onClick={() => toggleCard('high')}
          style={{ perspective: '1000px' }}
        >
          <div 
            className={`relative w-full h-full transition-transform duration-700 ${flippedCards.high ? '[transform:rotateY(180deg)]' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <Card className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 shadow-lg group-hover:shadow-2xl transition-shadow duration-300" style={{ backfaceVisibility: 'hidden' }}>
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                <div className="text-4xl font-bold mb-1 tabular-nums">{animatedCounters.high}</div>
                <div className="text-sm opacity-90">High Risk Codes</div>
                <div className="text-xs opacity-70 mt-2">Click to learn more</div>
              </CardContent>
            </Card>
            {/* Back */}
            <Card className="absolute inset-0 bg-gradient-to-br from-orange-700 to-orange-800 text-white border-0 shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <CardContent className="pt-4 px-4 pb-4 h-full flex flex-col justify-between text-xs">
                <div>
                  <div className="font-bold mb-1.5 text-sm">📞 Monitored Phone Codes</div>
                  <p className="leading-tight mb-2">We track {animatedCounters.high} country and area codes frequently used in romance fraud schemes. These numbers are red-flagged in our global database.</p>
                </div>
                <div className="bg-orange-900/50 p-2 rounded text-xs italic">
                  💡 "Real love doesn't ask for money transfers."
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Total Hotspots Card */}
        <div 
          className="relative h-32 cursor-pointer group"
          onClick={() => toggleCard('total')}
          style={{ perspective: '1000px' }}
        >
          <div 
            className={`relative w-full h-full transition-transform duration-700 ${flippedCards.total ? '[transform:rotateY(180deg)]' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <Card className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-yellow-700 text-white border-0 shadow-lg group-hover:shadow-2xl transition-shadow duration-300" style={{ backfaceVisibility: 'hidden' }}>
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                <div className="text-4xl font-bold mb-1 tabular-nums">{animatedCounters.total}</div>
                <div className="text-sm opacity-90">Total Hotspots Monitored</div>
                <div className="text-xs opacity-70 mt-2">Click to learn more</div>
              </CardContent>
            </Card>
            {/* Back */}
            <Card className="absolute inset-0 bg-gradient-to-br from-yellow-700 to-yellow-800 text-white border-0 shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <CardContent className="pt-4 px-4 pb-4 h-full flex flex-col justify-between text-xs">
                <div>
                  <div className="font-bold mb-1.5 text-sm">🌍 Global Coverage</div>
                  <p className="leading-tight mb-2">Our intelligence network monitors {animatedCounters.total} fraud hotspots worldwide, updated daily with new scam patterns and emerging threats.</p>
                </div>
                <div className="bg-yellow-900/50 p-2 rounded text-xs italic">
                  💡 "Your heart deserves protection—trust your instincts."
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Sliding Bottom Sheet for Region Details */}
      {showDetailPanel && selectedRegion && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeDetailPanel}
            aria-hidden="true"
          />
          <div 
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden transition-transform duration-300 ${
              showDetailPanel ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#5B3256]" />
                  <h3 className="text-lg font-bold text-[#5B3256]">{selectedRegion.name}</h3>
                </div>
                <button
                  onClick={closeDetailPanel}
                  className="text-[#5B3256] hover:bg-[#F5E8DC] p-2 rounded-full transition-colors"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold text-[#5B3256] mb-2">Risk Level</div>
                  <Badge className={`${getRiskBadgeClass(selectedRegion.risk_level)} text-sm px-3 py-1`}>
                    {selectedRegion.risk_level}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-[#5B3256] mb-2">Country Codes</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.codes.map((code, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm border-[#E6B7BE] text-[#5B3256]">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#F5E8DC] p-3 rounded-lg">
                  <div className="text-xs font-semibold text-[#5B3256] mb-1">⚠️ Safety Tip</div>
                  <p className="text-xs text-[#5B3256]/80">
                    {selectedRegion.risk_level === 'Extreme' 
                      ? 'This region has extremely high romance scam activity. Exercise extreme caution with contacts claiming to be from this area.'
                      : selectedRegion.risk_level === 'High'
                      ? 'This region shows elevated romance scam patterns. Verify identity thoroughly before sharing personal information.'
                      : 'While risk is moderate, always verify identity and never send money to online contacts.'}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    checkPhoneNumber(selectedRegion.codes[0])
                    closeDetailPanel()
                  }}
                  className="w-full bg-[#5B3256] hover:bg-[#5B3256]/90 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Run Risk Check
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
