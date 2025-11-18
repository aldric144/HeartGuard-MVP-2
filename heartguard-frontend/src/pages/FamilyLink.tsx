import { GuardianMode } from '@/components/GuardianMode'

export function FamilyLink() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E8DC] via-[#E6B7BE]/30 to-[#3C4B7C]/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#5B3256] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            FamilyLink™
          </h1>
          <p className="text-[#5B3256]/70">
            Protect your loved ones with Guardian Mode. Add trusted contacts who will be alerted when concerning patterns are detected.
          </p>
        </div>
        
        <GuardianMode conversationId="global" />
      </div>
    </div>
  )
}
