import { Shield, Heart, AlertTriangle, CheckCircle, Globe, Users, Lock, Download, ArrowRight, Star, Zap, Eye, FileText, Bell, TrendingUp, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Landing() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  const heroImage = null // Will be: '/images/landing/hero.jpg' when image is added

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-[#3C345C]" />
              <span className="text-2xl font-bold text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                HeartGuard™
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-[#2A2A2A] hover:text-[#3C345C] transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-[#2A2A2A] hover:text-[#3C345C] transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-[#2A2A2A] hover:text-[#3C345C] transition-colors">
                Pricing
              </button>
              <Button 
                onClick={() => window.location.href = '/app'}
                className="bg-[#3C345C] hover:bg-[#2C2347] text-white"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                Get the App
              </Button>
            </nav>
            <Button 
              onClick={() => window.location.href = '/app'}
              className="md:hidden bg-[#3C345C] hover:bg-[#2C2347] text-white"
              style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
            >
              Get App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2C2347] via-[#3C345C] to-[#C7A0A3] text-white py-20 md:py-32">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#E4B5C2] rounded-full opacity-20 blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D67A83] rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
            {/* Left column - Text content */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Your Heart. Protected by AI.
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 animate-fade-in-delayed">
                HeartGuard™ detects romance scams before they can trap you—using emotional intelligence, photo forensics, and real-time fraud detection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center animate-fade-in-delayed-2">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/app'}
                  className="bg-white text-[#2C2347] hover:bg-[#F9EDE2] text-lg px-8 py-6"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download on the App Store
                </Button>
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/app'}
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  Get HeartGuard Now
                </Button>
              </div>
              <p className="mt-6 text-sm text-white/70 text-center md:text-left">
                Coming soon to the App Store and Google Play
              </p>
            </div>

            {/* Right column - Hero image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="/images/landing/hero-woman-laptop.jpg" 
                alt="Person using a laptop at home" 
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Pain Section */}
      <section className="py-16 md:py-24 bg-[#F9EDE2]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            {/* Left column - Text content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2C2347] mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Romance Scams Manipulate Emotions
              </h2>
              <p className="text-lg text-[#2A2A2A] mb-6 leading-relaxed">
                Scammers use sophisticated psychological tactics to build trust, create emotional dependency, and exploit vulnerability. They craft fake identities, fabricate emergencies, and pressure victims into sending money—often leaving lasting emotional and financial damage.
              </p>
              <p className="text-lg text-[#2A2A2A] mb-8 leading-relaxed">
                This isn't your fault. Scams are designed to bypass rational thinking by targeting our deepest human needs for connection and love.
              </p>
              <div className="inline-block bg-gradient-to-r from-[#2C2347] to-[#3C345C] text-white px-8 py-4 rounded-lg">
                <p className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  "Healing begins with truth."
                </p>
              </div>
            </div>

            {/* Right column - Image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md">
              <img 
                src="/images/landing/section-businessman.jpg" 
                alt="Professional reviewing information on a laptop by a window" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Comprehensive Protection Features
            </h2>
            <p className="text-xl text-[#2A2A2A]/70 max-w-2xl mx-auto">
              HeartGuard™ combines multiple AI engines to give you the complete picture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* ToneShift */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#2C2347] to-[#3C345C] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  ToneShift™ Chat Analysis
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  Detect emotional manipulation before it's too late
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  AI-powered sentiment drift detection identifies rapid emotional changes, love bombing, gaslighting, and manipulation patterns in real-time conversations.
                </p>
              </CardContent>
            </Card>

            {/* WalletWatch */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#D67A83] to-[#C7A0A3] rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  WalletWatch™ Financial Detector
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  See financial red flags in real time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  Instantly identifies money requests, cryptocurrency schemes, gift card demands, wire transfers, and emergency financial pressure tactics.
                </p>
              </CardContent>
            </Card>

            {/* Photo Verification */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#3C345C] to-[#5A557D] rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Photo Verification Engine
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  Reverse image search, deepfake detection, metadata inspection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  Advanced AI analyzes photos for authenticity, checks against known scammer databases, detects AI-generated images, and validates metadata integrity.
                </p>
              </CardContent>
            </Card>

            {/* Evidence Locker */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#2C2347] to-[#C7A0A3] rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Evidence Locker™
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  Legal-grade reports designed to support law enforcement documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  Generate comprehensive PDF reports with SHA-256 verification, QR codes, chain-of-custody metadata, and detailed analysis for legal proceedings.
                </p>
              </CardContent>
            </Card>

            {/* Trust Score */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#D67A83] to-[#E4B5C2] rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Trust Score System
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  0–100 analysis with interactive, explainable AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  Weighted algorithm combines chat analysis, photo verification, financial patterns, and network intelligence into a single, easy-to-understand trust score.
                </p>
              </CardContent>
            </Card>

            {/* Guardian Mode */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#3C345C] to-[#2C2347] rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Guardian Mode™
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  Real-time monitoring with smart alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  24/7 conversation monitoring alerts trusted contacts when concerning patterns emerge, with configurable thresholds and smart cooldown to prevent alert fatigue.
                </p>
              </CardContent>
            </Card>

            {/* FamilyLink */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#C7A0A3] to-[#E4B5C2] rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  FamilyLink™
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  Protect the people you care about
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  Build a trusted contact network where family members receive alerts when high-risk patterns are detected, creating a safety net for vulnerable loved ones.
                </p>
              </CardContent>
            </Card>

            {/* Scam Hotspot Map */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#2C2347] to-[#D67A83] rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Scam Hotspot Map™
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  Global risk intelligence with phone-number danger insight
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  Interactive world map shows high-risk phone code origins, scam types by region, and real-world intelligence on romance scam operations worldwide.
                </p>
              </CardContent>
            </Card>

            {/* IP Intelligence */}
            <Card className="border-2 border-[#E4B5C2] hover:border-[#D67A83] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#5A557D] to-[#3C345C] rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  IP Intelligence
                </CardTitle>
                <CardDescription className="text-[#2A2A2A]/70">
                  VPN/Tor detection and geo-risk tagging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#2A2A2A]">
                  Network analysis identifies VPN usage, Tor networks, suspicious geolocations, and anonymization services commonly used by scammers to hide their identity.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => scrollToSection('how-it-works')}
              className="bg-[#3C345C] hover:bg-[#2C2347] text-white"
              style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
            >
              See How It Works
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-br from-[#F9EDE2] to-[#F3DBC8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              How It Works
            </h2>
            <p className="text-xl text-[#2A2A2A]/70 max-w-2xl mx-auto">
              Get comprehensive protection in three simple steps
            </p>
          </div>

          {/* Intro with image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto mb-12">
            {/* Left column - Image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md">
              <img 
                src="/images/landing/section-sofa-woman.jpg" 
                alt="Person using a laptop on a sofa" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Right column - Description */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Instant Trust Score Analysis
              </h3>
              <p className="text-lg text-[#2A2A2A] leading-relaxed">
                Our AI-powered system analyzes your conversations and photos in seconds, providing you with a comprehensive trust score from 0-100. Get instant clarity on whether someone is genuine or potentially dangerous.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2C2347] to-[#3C345C] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-[#2C2347] mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Paste Chat or Upload Photo
                </h3>
                <p className="text-[#2A2A2A]/70">
                  Simply paste your conversation messages or upload profile photos from your online dating match.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D67A83] to-[#C7A0A3] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-[#2C2347] mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  HeartGuard Analyzes Everything
                </h3>
                <p className="text-[#2A2A2A]/70">
                  Our AI analyzes manipulation patterns, identity authenticity, location risks, and financial red flags in seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3C345C] to-[#5A557D] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-[#2C2347] mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Get Your Trust Score + Report
                </h3>
                <p className="text-[#2A2A2A]/70">
                  Receive a clear trust score, detailed recommendations, and optional legal-grade PDF documentation.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/app'}
                className="bg-[#2C2347] hover:bg-[#3C345C] text-white"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                Start Your First Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Gallery */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              See HeartGuard™ in Action
            </h2>
            <p className="text-xl text-[#2A2A2A]/70 max-w-2xl mx-auto">
              Powerful protection with an intuitive, beautiful interface
            </p>
          </div>

          {/* Feature highlights with images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {/* Guardian Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/images/landing/section-joyful-woman.jpg" 
                  alt="Person smiling while using a laptop at home" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2C2347] mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Guardian Mode™
                </h3>
                <p className="text-[#2A2A2A]/70">
                  Real-time monitoring with smart alerts to protect you and your loved ones from emerging threats.
                </p>
              </div>
            </div>

            {/* Scam Hotspot Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="md:order-last">
                <h3 className="text-xl font-bold text-[#2C2347] mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Scam Hotspot Map™
                </h3>
                <p className="text-[#2A2A2A]/70">
                  Global intelligence showing high-risk phone code origins and scam types by region worldwide.
                </p>
              </div>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md md:order-first">
                <img 
                  src="/images/landing/section-dock-woman.jpg" 
                  alt="Person relaxing by the water" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Home Tab', desc: 'Start your analysis' },
              { title: 'Results Tab', desc: 'Detailed trust scores' },
              { title: 'Guardian Mode', desc: 'Real-time protection' },
              { title: 'FamilyLink', desc: 'Trusted contacts' },
              { title: 'Scam Hotspot Map', desc: 'Global intelligence' },
              { title: 'PDF Reports', desc: 'Legal documentation' }
            ].map((screen, idx) => (
              <div key={idx} className="relative">
                <div className="aspect-[9/16] bg-gradient-to-br from-[#2C2347] via-[#3C345C] to-[#C7A0A3] rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">{screen.title}</p>
                    <p className="text-sm opacity-75">{screen.desc}</p>
                  </div>
                </div>
                <p className="text-center mt-4 text-[#2A2A2A] font-semibold">{screen.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Continued in next part due to length */}
      <section id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-[#F9EDE2] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Choose Your Protection Level
            </h2>
            <p className="text-xl text-[#2A2A2A]/70 max-w-2xl mx-auto mb-8">
              From free basic protection to comprehensive family plans
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-[#2A2A2A]/70">
              <span>Monthly</span>
              <span className="text-[#3C345C] font-semibold">• Save up to 25% with annual plans</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 border-[#E4B5C2]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Free
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#2C2347]">$0</span>
                  <span className="text-[#2A2A2A]/70">/month</span>
                </div>
                <CardDescription className="text-[#2A2A2A]/70 mt-2">
                  Perfect for trying HeartGuard™
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">5 analyses/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">2 photo verifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Basic trust score</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Scam Hotspot Map</span>
                  </li>
                  <li className="flex items-start gap-2 text-[#2A2A2A]/50">
                    <span className="text-sm">PDFs: $4.99 each</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app'}
                  className="w-full bg-[#E4B5C2] hover:bg-[#D67A83] text-[#2C2347]"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Essential Tier */}
            <Card className="border-2 border-[#D67A83]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Essential
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#2C2347]">$9.99</span>
                  <span className="text-[#2A2A2A]/70">/month</span>
                </div>
                <CardDescription className="text-[#2A2A2A]/70 mt-2">
                  For regular daters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">30 analyses/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">10 photo verifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">3 PDF reports included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">IP Intelligence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">1 Guardian conversation</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app'}
                  className="w-full bg-[#D67A83] hover:bg-[#C7A0A3] text-white"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  Get Essential
                </Button>
              </CardContent>
            </Card>

            {/* Guardian Tier - Most Popular */}
            <Card className="border-2 border-[#3C345C] relative shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#3C345C] text-white px-4 py-1">
                  MOST POPULAR
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Guardian
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#2C2347]">$19.99</span>
                  <span className="text-[#2A2A2A]/70">/month</span>
                </div>
                <CardDescription className="text-[#2A2A2A]/70 mt-2">
                  Comprehensive protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">150 analyses/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">30 photo verifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">10 PDF reports included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Explainable AI Dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">5 Guardian conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">3 trusted contacts</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app'}
                  className="w-full bg-[#3C345C] hover:bg-[#2C2347] text-white"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  Get Guardian
                </Button>
              </CardContent>
            </Card>

            {/* Evidence Pro Tier */}
            <Card className="border-2 border-[#2C2347]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Evidence Pro
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#2C2347]">$39.99</span>
                  <span className="text-[#2A2A2A]/70">/month</span>
                </div>
                <CardDescription className="text-[#2A2A2A]/70 mt-2">
                  Legal-grade documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Everything in Guardian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A] font-semibold">Unlimited PDF reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Chain-of-custody metadata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">10 trusted contacts</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app'}
                  className="w-full bg-[#2C2347] hover:bg-[#3C345C] text-white"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  Get Evidence Pro
                </Button>
              </CardContent>
            </Card>

            {/* Family Plan */}
            <Card className="border-2 border-[#C7A0A3]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Family Plan
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#2C2347]">$29.99</span>
                  <span className="text-[#2A2A2A]/70">/month</span>
                </div>
                <CardDescription className="text-[#2A2A2A]/70 mt-2">
                  Protect your whole family
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A] font-semibold">5 seats included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">300 analyses (pooled)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">50 photos (pooled)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">25 PDFs (pooled)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Central family dashboard</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app'}
                  className="w-full bg-[#C7A0A3] hover:bg-[#D67A83] text-white"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  Get Family Plan
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-2 border-[#5A557D]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#2C2347]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Enterprise
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#2C2347]">Custom</span>
                </div>
                <CardDescription className="text-[#2A2A2A]/70 mt-2">
                  For teams & organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Team dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">SSO/SAML</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3C345C] flex-shrink-0 mt-0.5" />
                    <span className="text-[#2A2A2A]">Custom integrations</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app'}
                  className="w-full bg-[#5A557D] hover:bg-[#3C345C] text-white"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-[#2A2A2A]/70">
              All plans include 7-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Family Protection Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Protect Your Loved Ones
              </h2>
              <p className="text-xl text-[#2A2A2A]/70">
                FamilyLink™ creates a safety network for vulnerable family members
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Who Benefits from FamilyLink™?
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-[#D67A83] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#2C2347]">Seniors & Elderly Parents</p>
                      <p className="text-[#2A2A2A]/70">Protect aging parents from romance scams targeting loneliness</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-[#D67A83] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#2C2347]">Young Adults & Teens</p>
                      <p className="text-[#2A2A2A]/70">Help young people navigate online dating safely</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-[#D67A83] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#2C2347]">Vulnerable Adults</p>
                      <p className="text-[#2A2A2A]/70">Support family members with cognitive challenges or emotional vulnerability</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/images/landing/section-senior-man.jpg" 
                  alt="Older adult using a tablet on a couch" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How FamilyLink Works - Additional Info */}
      <section className="py-12 bg-gradient-to-br from-[#F9EDE2] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#2C2347] to-[#C7A0A3] rounded-2xl p-8 text-white">
              <h4 className="text-xl font-bold mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                How FamilyLink™ Works
              </h4>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">1</span>
                  <p>Add trusted family members as contacts</p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">2</span>
                  <p>Set alert thresholds for concerning patterns</p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">3</span>
                  <p>Receive instant notifications when risks are detected</p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">4</span>
                  <p>Intervene early to prevent financial and emotional harm</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-16 md:py-24 bg-[#F9EDE2]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Lock className="w-16 h-16 text-[#3C345C] mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Your Privacy & Security
              </h2>
              <p className="text-xl text-[#2A2A2A]/70">
                We take your data protection seriously
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-[#E4B5C2]">
                <CardHeader>
                  <CheckCircle className="w-8 h-8 text-[#3C345C] mb-2" />
                  <CardTitle className="text-[#2C2347]">GDPR Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#2A2A2A]/70">
                    Full compliance with European data protection regulations. Your data, your control.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#E4B5C2]">
                <CardHeader>
                  <CheckCircle className="w-8 h-8 text-[#3C345C] mb-2" />
                  <CardTitle className="text-[#2C2347]">End-to-End Encryption</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#2A2A2A]/70">
                    All data is encrypted in transit and at rest. Your conversations stay private.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#E4B5C2]">
                <CardHeader>
                  <CheckCircle className="w-8 h-8 text-[#3C345C] mb-2" />
                  <CardTitle className="text-[#2C2347]">No Data Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#2A2A2A]/70">
                    We never sell your data to third parties. Your trust is our business model.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#E4B5C2]">
                <CardHeader>
                  <CheckCircle className="w-8 h-8 text-[#3C345C] mb-2" />
                  <CardTitle className="text-[#2C2347]">Regular Security Audits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#2A2A2A]/70">
                    Independent security assessments ensure your data stays protected.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-6 bg-white rounded-lg border-2 border-[#D67A83]">
              <h3 className="font-bold text-[#2C2347] mb-2">Important Disclaimer</h3>
              <p className="text-sm text-[#2A2A2A]/70">
                HeartGuard™ is for informational purposes only. Not a background check service. Not FCRA compliant. Not for employment, credit, or housing decisions. Evidence Locker™ reports are designed to support law enforcement documentation but are not certified legal documents. Always consult legal counsel for official proceedings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-[#2C2347] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Trusted by Thousands
            </h2>
            <p className="text-xl text-[#2A2A2A]/70">
              Real protection for real people
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-[#E4B5C2]">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-[#D67A83] text-[#D67A83]" />
                  ))}
                </div>
                <p className="text-[#2A2A2A] mb-4">
                  "This app gave me the confidence to trust my instincts. The trust score confirmed what I was feeling but couldn't prove."
                </p>
                <p className="text-sm text-[#2A2A2A]/70">
                  — Sarah M., Guardian User
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#E4B5C2]">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-[#D67A83] text-[#D67A83]" />
                  ))}
                </div>
                <p className="text-[#2A2A2A] mb-4">
                  "FamilyLink helped me protect my elderly mother from a scammer. The alerts came just in time."
                </p>
                <p className="text-sm text-[#2A2A2A]/70">
                  — Michael T., Family Plan User
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#E4B5C2]">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-[#D67A83] text-[#D67A83]" />
                  ))}
                </div>
                <p className="text-[#2A2A2A] mb-4">
                  "The Evidence Locker PDF was exactly what law enforcement needed. Professional and comprehensive."
                </p>
                <p className="text-sm text-[#2A2A2A]/70">
                  — Jennifer L., Evidence Pro User
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#2C2347] via-[#3C345C] to-[#C7A0A3] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Protect Your Heart Today
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Join thousands who trust HeartGuard™ to keep them safe in online dating
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/app'}
                className="bg-white text-[#2C2347] hover:bg-[#F9EDE2] text-lg px-8 py-6"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                <Download className="mr-2 h-5 w-5" />
                Get the App
              </Button>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/app'}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                Start Your First Analysis
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/70">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2347] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6" />
                <span className="text-xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  HeartGuard™
                </span>
              </div>
              <p className="text-white/70 text-sm">
                AI-powered romance scam protection for online dating safety.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Product</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><a href="/app" className="hover:text-white transition-colors">Get Started</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Legal</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/app" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Disclaimer</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">GDPR Compliance</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Support</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/app" className="hover:text-white transition-colors">Safety & Trauma Support</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Report a Scam</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/70">
                © 2025 HeartGuard™. All rights reserved.
              </p>
              <div className="flex gap-4">
                <div className="text-sm text-white/70">
                  Coming soon to App Store and Google Play
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
