import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, Search, MapPin, AlertTriangle, Shield } from 'lucide-react'

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

  const checkPhoneNumber = async (codeToCheck?: string) => {
    const code = codeToCheck || phoneNumber
    if (!code.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/analyze/location/${encodeURIComponent(code)}`)
      if (!response.ok) throw new Error('Failed to check phone number')
      const data = await response.json()
      setResult(data)
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
              <div className="relative bg-gradient-to-br from-[#3C4B7C]/10 to-[#5B3256]/10 rounded-xl p-4 mb-3">
                {/* World Map SVG */}
                <svg viewBox="0 0 100 70" className="w-full h-auto">
                  {/* Ocean background */}
                  <rect x="0" y="0" width="100" height="70" fill="#DBEAFE" opacity="0.5" />
                  
                  {/* Continents with better contrast */}
                  {/* North America */}
                  <path d="M 8 30 L 12 25 L 18 22 L 24 24 L 28 28 L 30 35 L 28 42 L 24 48 L 20 50 L 15 48 L 12 45 L 10 40 L 8 35 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="0.3" opacity="0.8" />
                  {/* South America */}
                  <path d="M 24 52 L 28 50 L 32 52 L 34 58 L 32 65 L 28 68 L 24 66 L 22 60 L 23 54 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="0.3" opacity="0.8" />
                  {/* Europe */}
                  <path d="M 45 28 L 50 25 L 56 26 L 60 30 L 58 35 L 54 38 L 48 36 L 45 32 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="0.3" opacity="0.8" />
                  {/* Africa */}
                  <path d="M 46 40 L 50 38 L 56 40 L 58 45 L 58 52 L 56 60 L 52 66 L 48 64 L 46 58 L 44 50 L 45 44 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="0.3" opacity="0.8" />
                  {/* Asia */}
                  <path d="M 62 28 L 68 24 L 75 26 L 82 30 L 88 35 L 90 42 L 88 48 L 82 52 L 76 54 L 70 52 L 65 48 L 62 42 L 60 35 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="0.3" opacity="0.8" />
                  {/* Australia */}
                  <path d="M 78 58 L 84 56 L 88 58 L 90 62 L 88 66 L 82 68 L 78 66 L 76 62 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="0.3" opacity="0.8" />
                  
                  {/* Hotspot markers */}
                  {HOTSPOT_REGIONS.map((region, idx) => (
                    <g key={idx}>
                      <circle
                        cx={region.position.x}
                        cy={region.position.y}
                        r="2.5"
                        fill={region.color}
                        opacity="0.9"
                        className="cursor-pointer hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setSelectedRegion(region)
                          quickCheck(region.codes[0])
                        }}
                      />
                      <circle
                        cx={region.position.x}
                        cy={region.position.y}
                        r="4.5"
                        fill={region.color}
                        opacity="0.3"
                        className="animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                      {/* Region label */}
                      <text
                        x={region.position.x}
                        y={region.position.y - 4}
                        fontSize="2.5"
                        fill="#1E293B"
                        textAnchor="middle"
                        className="pointer-events-none font-semibold"
                        style={{ textShadow: '0 0 2px white' }}
                      >
                        {region.name}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Legend */}
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

              {/* Selected Region Info */}
              {selectedRegion && (
                <Alert className="bg-[#F5E8DC] border-[#E6B7BE]">
                  <MapPin className="h-4 w-4 text-[#5B3256]" />
                  <AlertDescription className="text-[#5B3256]">
                    <div className="font-semibold mb-2 text-sm">{selectedRegion.name}</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selectedRegion.codes.slice(0, 3).map((code, idx) => (
                        <Badge key={idx} className={`${getRiskBadgeClass(selectedRegion.risk_level)} text-xs`}>
                          {code}
                        </Badge>
                      ))}
                      {selectedRegion.codes.length > 3 && (
                        <Badge className="bg-gray-500 text-white text-xs">
                          +{selectedRegion.codes.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs">
                      Risk: <Badge className={`${getRiskBadgeClass(selectedRegion.risk_level)} text-xs`}>{selectedRegion.risk_level}</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
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
                    <div className={`p-3 rounded-xl border-2 ${result.is_known_scam_origin ? 'bg-red-50 border-red-600' : 'bg-green-50 border-green-600'}`}>
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
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{
                                    width: `${result.location_risk_score}%`,
                                    backgroundColor: getRiskColor(result.risk_level || 'Medium')
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold" style={{ color: getRiskColor(result.risk_level || 'Medium') }}>
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

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-1">8</div>
            <div className="text-sm opacity-90">Extreme Risk Regions</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-1">32</div>
            <div className="text-sm opacity-90">High Risk Codes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-1">72</div>
            <div className="text-sm opacity-90">Total Hotspots Monitored</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
