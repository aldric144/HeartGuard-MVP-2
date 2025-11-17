import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface WeightedComponent {
  engine: string;
  score: number;
  weight: number;
  contribution: number;
}

interface SimulationResult {
  trust_score: number;
  confidence_level: string;
  color_band: string;
  weighted_breakdown: WeightedComponent[];
}

interface ExplainableAIProps {
  conversationId?: string;
  initialBreakdown?: WeightedComponent[];
  initialTrustScore?: number;
}

const ExplainableAI: React.FC<ExplainableAIProps> = ({ 
  conversationId, 
  initialBreakdown = [],
  initialTrustScore = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [breakdown, setBreakdown] = useState<WeightedComponent[]>(initialBreakdown);
  const [simulatedScore, setSimulatedScore] = useState(initialTrustScore);
  const [confidenceLevel, setConfidenceLevel] = useState('Medium');
  const [colorBand, setColorBand] = useState('yellow');
  
  const [toneshiftScore, setToneshiftScore] = useState(50);
  const [walletwatchScore, setWalletwatchScore] = useState(50);
  const [photoScore, setPhotoScore] = useState(50);
  const [metadataScore, setMetadataScore] = useState(50);
  
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (initialBreakdown.length > 0) {
      initialBreakdown.forEach(component => {
        if (component.engine === 'ToneShift™') setToneshiftScore(component.score);
        if (component.engine === 'WalletWatch™') setWalletwatchScore(component.score);
        if (component.engine === 'Photo Provenance') setPhotoScore(component.score);
        if (component.engine === 'Metadata Integrity') setMetadataScore(component.score);
      });
    }
  }, [initialBreakdown]);

  useEffect(() => {
    const timer = setTimeout(() => {
      simulateTrustScore();
    }, 500);

    return () => clearTimeout(timer);
  }, [toneshiftScore, walletwatchScore, photoScore, metadataScore]);

  const simulateTrustScore = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/simulate/trustscore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          override_toneshift_score: toneshiftScore,
          override_walletwatch_score: walletwatchScore,
          override_photo_score: photoScore,
          override_metadata_score: metadataScore,
          conversation_id: conversationId
        })
      });

      if (response.ok) {
        const result: SimulationResult = await response.json();
        setBreakdown(result.weighted_breakdown);
        setSimulatedScore(result.trust_score);
        setConfidenceLevel(result.confidence_level);
        setColorBand(result.color_band);
      }
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const getColorForEngine = (engine: string) => {
    if (engine === 'ToneShift™') return '#8b5cf6';
    if (engine === 'WalletWatch™') return '#ec4899';
    if (engine === 'Photo Provenance') return '#06b6d4';
    if (engine === 'Metadata Integrity') return '#10b981';
    return '#6b7280';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Explainable AI + What-If Simulator</h3>
            <p className="text-sm text-gray-400">Full transparency into Trust Score calculation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: getScoreColor(simulatedScore) }}>
              {simulatedScore}
            </div>
            <div className="text-xs text-gray-400">Simulated Score</div>
          </div>
          <svg
            className={`w-6 h-6 text-purple-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Contribution Bar Chart */}
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-4">Engine Contribution Breakdown</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="engine" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'Contribution', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'contribution') return [`${value.toFixed(1)}`, 'Contribution'];
                    return [value, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af' }}
                  formatter={() => 'Contribution to Final Score'}
                />
                <Bar dataKey="contribution" radius={[8, 8, 0, 0]}>
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForEngine(entry.engine)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* What-If Simulator Sliders */}
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-4">
              What-If Simulator {isSimulating && <span className="text-purple-400 text-xs">(Calculating...)</span>}
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Adjust engine scores to test hypothetical scenarios and see how they impact the final Trust Score
            </p>

            <div className="space-y-4">
              {/* ToneShift Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-purple-300 font-medium">ToneShift™</label>
                  <span className="text-sm font-bold text-white">{toneshiftScore.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toneshiftScore}
                  onChange={(e) => setToneshiftScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>High Risk</span>
                  <span>Low Risk</span>
                </div>
              </div>

              {/* WalletWatch Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-pink-300 font-medium">WalletWatch™</label>
                  <span className="text-sm font-bold text-white">{walletwatchScore.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={walletwatchScore}
                  onChange={(e) => setWalletwatchScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-pink"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Financial Request</span>
                  <span>No Request</span>
                </div>
              </div>

              {/* Photo Provenance Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-cyan-300 font-medium">Photo Provenance</label>
                  <span className="text-sm font-bold text-white">{photoScore.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={photoScore}
                  onChange={(e) => setPhotoScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fake/Stolen</span>
                  <span>Authentic</span>
                </div>
              </div>

              {/* Metadata Integrity Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-green-300 font-medium">Metadata Integrity</label>
                  <span className="text-sm font-bold text-white">{metadataScore.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={metadataScore}
                  onChange={(e) => setMetadataScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Suspicious</span>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weighted Formula Explanation */}
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Trust Score Formula</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p className="font-mono">
                Trust Score = (ToneShift × 0.50) + (WalletWatch × 0.30) + (Photo × 0.15) + (Metadata × 0.05)
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {breakdown.map((component) => (
                  <div key={component.engine} className="flex items-center justify-between bg-black/40 rounded px-3 py-2">
                    <span className="text-xs text-gray-400">{component.engine}</span>
                    <span className="text-xs font-bold" style={{ color: getColorForEngine(component.engine) }}>
                      {(component.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .slider-pink::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #ec4899, #f472b6);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .slider-cyan::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #06b6d4, #22d3ee);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #10b981, #34d399);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #fff;
        }
      `}</style>
    </div>
  );
};

export default ExplainableAI;
