# HeartGuard™ Pre-Launch Checklist
## App Store & Google Play Readiness

**Last Updated:** November 19, 2025  
**Status:** In Progress  
**Target Launch:** TBD

---

## 🚨 CRITICAL DECISIONS NEEDED FIRST

### 1. Mobile App Strategy (MUST DECIDE NOW)
- [ ] **Decision:** Choose mobile packaging approach
  - [ ] Option A: Capacitor (wrap React web app) - **RECOMMENDED** (fastest)
  - [ ] Option B: React Native (rewrite for native)
  - [ ] Option C: Web-only (cannot submit to app stores)
- [ ] **Note:** You CANNOT submit a website to App Store/Play Store - you need iOS/Android binaries

### 2. Payment Strategy (MUST DECIDE NOW)
- [ ] **Decision:** Choose payment platform per channel
  - [ ] Web: Stripe (already planned) ✓
  - [ ] iOS: Apple In-App Purchases (StoreKit 2) - **REQUIRED by Apple**
  - [ ] Android: Google Play Billing - **REQUIRED by Google**
- [ ] **Note:** iOS/Android CANNOT direct users to Stripe for digital purchases - must use native IAP
- [ ] **Action:** Build unified "Entitlements" backend service to manage subscriptions across all platforms

---

## 📱 PHASE 1: MOBILE APP FOUNDATION (Week 1-2)

### App Packaging & Setup
- [ ] Install and configure Capacitor for iOS/Android
- [ ] Set up Xcode project for iOS build
- [ ] Set up Android Studio project for Android build
- [ ] Configure app icons (1024x1024 for iOS, various sizes for Android)
- [ ] Configure splash screens for both platforms
- [ ] Set bundle identifier (iOS) and package name (Android)
- [ ] Test WebView navigation and deep linking
- [ ] Configure safe areas and notch handling
- [ ] Test file picker/camera roll access for photo uploads
- [ ] Test "paste chat" functionality on mobile keyboards

### Apple Developer Account
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID and bundle identifier
- [ ] Generate provisioning profiles
- [ ] Set up signing certificates
- [ ] Configure App Store Connect account
- [ ] Add team members if needed

### Google Play Developer Account
- [ ] Enroll in Google Play Console ($25 one-time)
- [ ] Choose package name (cannot change later)
- [ ] Set up app signing by Google Play
- [ ] Back up release keystore securely
- [ ] Configure Play Console account
- [ ] Add team members if needed

---

## 💳 PHASE 2: PAYMENTS & SUBSCRIPTIONS (Week 2-4)

### Stripe Integration (Web)
- [ ] Create Stripe account (production)
- [ ] Configure Stripe Tax (if needed for your regions)
- [ ] Set up subscription products matching SUBSCRIPTION_TIERS.md:
  - [ ] Essential: $9.99/month or $89/year
  - [ ] Guardian: $19.99/month or $179/year
  - [ ] Evidence Pro: $39.99/month or $359/year
  - [ ] Family Plan: $29.99/month or $269/year
- [ ] Configure 7-day free trial for Guardian Pro
- [ ] Configure 14-day trial for Evidence Pro
- [ ] Set up Stripe webhooks for subscription events
- [ ] Implement Stripe Customer Portal for manage/cancel
- [ ] Test checkout flow end-to-end
- [ ] Test cancellation and refund flows

### Apple In-App Purchases (iOS)
- [ ] Create subscription group in App Store Connect
- [ ] Configure subscription tiers (match Stripe pricing):
  - [ ] Essential: $9.99/month or $89/year
  - [ ] Guardian: $19.99/month or $179/year
  - [ ] Evidence Pro: $39.99/month or $359/year
  - [ ] Family Plan: $29.99/month or $269/year (Shared subscription)
- [ ] Set up free trial periods (7-day for Guardian, 14-day for Evidence Pro)
- [ ] Add subscription localizations and descriptions
- [ ] Create StoreKit configuration file for testing
- [ ] Implement StoreKit 2 purchase flow in app
- [ ] Implement "Restore Purchases" functionality
- [ ] Add subscription management deep link to iOS Settings

### Google Play Billing (Android)
- [ ] Create subscription products in Play Console
- [ ] Configure base plans and offers (match pricing)
- [ ] Set up free trial periods
- [ ] Add subscription localizations
- [ ] Implement Google Play Billing Library v5+
- [ ] Implement purchase flow
- [ ] Implement "Restore Purchases" functionality
- [ ] Test on real device with test account

### Backend Entitlements Service
- [ ] Create unified subscription/entitlements database schema
- [ ] Implement Stripe webhook handlers (subscription.created, updated, deleted, etc.)
- [ ] Implement Apple App Store Server API integration
- [ ] Implement Apple App Store Server Notifications V2 webhook
- [ ] Implement Google Play Developer API integration
- [ ] Implement Google Real-time Developer Notifications webhook
- [ ] Create server-side receipt validation for Apple/Google
- [ ] Build entitlements check API endpoint (returns user's current tier + limits)
- [ ] Implement usage tracking (analyses, photos, PDFs per billing period)
- [ ] Implement usage limit enforcement (soft warnings at 80%, hard blocks at 100%)
- [ ] Support cross-platform subscription migration
- [ ] Test subscription lifecycle: purchase → renew → cancel → refund → grace period

---

## 🔐 PHASE 3: AUTHENTICATION & ACCOUNT MANAGEMENT (Week 3-4)

### Authentication
- [ ] Verify auth works in mobile WebView (cookies/storage/redirects)
- [ ] Test login/logout on iOS
- [ ] Test login/logout on Android
- [ ] Implement email verification flow (mobile-friendly)
- [ ] Implement password reset flow (mobile-friendly)
- [ ] **If using Google/Facebook login:** Add "Sign in with Apple" (required by Apple)

### Account Management (REQUIRED BY APPLE)
- [ ] **CRITICAL:** Build in-app "Delete Account" button (visible, self-serve)
- [ ] Implement backend account deletion endpoint
- [ ] Define data deletion timeline (recommend ≤30 days)
- [ ] Document what data is deleted and what is retained (legal/audit logs)
- [ ] Implement irreversible deletion (no recovery after X days)
- [ ] Send confirmation email on account deletion
- [ ] Test deletion flow end-to-end
- [ ] Add "Export My Data" feature (optional but recommended for GDPR)

---

## ⚖️ PHASE 4: LEGAL & COMPLIANCE (Week 4-5)

### Legal Documents (Must be hosted at your domain)
- [ ] Update Privacy Policy for mobile app
  - [ ] List all data collected (chats, photos, location, device info, etc.)
  - [ ] List third-party processors (Stripe, Vercel, AI APIs, image search services)
  - [ ] Document data retention periods (30 days free, 6-24 months paid)
  - [ ] Document deletion timeline
  - [ ] International data transfers (if applicable)
  - [ ] Children's privacy (COPPA - likely N/A if 12+/Teen)
  - [ ] Add support/privacy contact email
- [ ] Update Terms of Service
  - [ ] Mobile-specific terms
  - [ ] Subscription terms (trials, cancellation, refunds)
  - [ ] Acceptable use policy
- [ ] Update Disclaimers
  - [ ] "Not a background check service"
  - [ ] "Not FCRA compliant"
  - [ ] "For informational purposes only"
  - [ ] Evidence Locker legal limitations
- [ ] Create Refund Policy page
  - [ ] 7-day money-back guarantee
  - [ ] No refunds if PDFs generated
  - [ ] Prorated refunds for annual plans (within 30 days)

### App Store Privacy Disclosures
- [ ] **Apple App Privacy "Nutrition Labels"** (App Store Connect)
  - [ ] List all data types collected (contact info, user content, identifiers, usage data, diagnostics)
  - [ ] Mark which data is "linked to identity" vs "not linked"
  - [ ] Mark which data is used for "tracking" (cross-app/site tracking)
  - [ ] Provide purpose for each data type
- [ ] **Google Play Data Safety Form** (Play Console)
  - [ ] List all data collected and shared
  - [ ] Mark security practices (encryption in transit/at rest)
  - [ ] Mark data deletion option
  - [ ] Provide data handling details

### Age Rating & Content Rating
- [ ] Complete Apple Age Rating questionnaire
  - [ ] Likely 12+ due to dating/relationship content
  - [ ] Mention "Infrequent/Mild Mature/Suggestive Themes"
- [ ] Complete Google Play Content Rating questionnaire (IARC)
  - [ ] Likely Teen (13+)
  - [ ] Answer questions about violence, sexual content, language, etc.

### Regional Compliance
- [ ] GDPR compliance (if serving EU users)
  - [ ] Data subject rights (access, deletion, portability)
  - [ ] DPO or contact email listed
  - [ ] Cookie/analytics consent (if applicable)
- [ ] CCPA compliance (if serving California users)
  - [ ] "Do Not Sell My Personal Information" link
  - [ ] Data deletion requests
- [ ] Export compliance
  - [ ] Answer Apple export compliance questions (uses standard encryption)

---

## 🔒 PHASE 5: SECURITY & PRIVACY (Week 5-6)

### Backend Security
- [ ] HTTPS everywhere with HSTS headers
- [ ] No secrets in Git repository (use environment variables)
- [ ] Secure JWT/session management
- [ ] CSRF protection enabled
- [ ] CORS configured correctly for app domains
- [ ] Rate limiting on all API endpoints (especially uploads/analysis)
- [ ] PII encryption at rest for sensitive fields
- [ ] Password hashing with argon2 or bcrypt
- [ ] Access controls for Evidence Locker PDFs (signed URLs with expiration)
- [ ] Audit logging with PII redaction
- [ ] SQL injection prevention (parameterized queries)
- [ ] File upload validation (size, type, malware scanning)

### Client Security
- [ ] No API keys or secrets in app bundle
- [ ] Secure storage for tokens (Keychain on iOS, Keystore on Android)
- [ ] Certificate pinning (optional but recommended)
- [ ] Safe external link handling (only open verified domains)
- [ ] Universal Links (iOS) / App Links (Android) for your domain

### Third-Party Security
- [ ] Data Processing Agreements (DPAs) with all vendors:
  - [ ] Stripe
  - [ ] Vercel
  - [ ] Any AI/vision APIs
  - [ ] Reverse image search services
- [ ] Document data retention schedules for:
  - [ ] Uploaded chats (30 days to 24 months based on tier)
  - [ ] Uploaded photos (same as chats)
  - [ ] Generated PDFs (same as chats)
  - [ ] Server logs (recommend 90 days)
  - [ ] Crash logs (recommend 90 days)

---

## 🎨 PHASE 6: CONTENT, UX & ACCESSIBILITY (Week 6-7)

### In-App Content
- [ ] Legal acceptance modal on first launch (Terms + Privacy)
- [ ] Trauma-informed safety copy throughout app
- [ ] Clear help/support links on every major screen
- [ ] "Report a Scam" feature accessible
- [ ] Crisis resources (hotlines, support organizations)
- [ ] Onboarding flow for new users
- [ ] Empty states for all features
- [ ] Error messages that are helpful and empathetic

### Accessibility (WCAG AA compliance)
- [ ] Large text support (Dynamic Type on iOS, font scaling on Android)
- [ ] Color contrast ratios meet AA standards (4.5:1 for text)
- [ ] VoiceOver labels (iOS) for all interactive elements
- [ ] TalkBack labels (Android) for all interactive elements
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] No information conveyed by color alone
- [ ] Test with screen readers on both platforms

### Performance Optimization
- [ ] **CRITICAL:** Compress hero/section images (currently 2-13 MB each!)
  - [ ] hero-woman-laptop.jpg (3.8 MB → target <500 KB)
  - [ ] section-businessman.jpg (13 MB → target <500 KB)
  - [ ] section-sofa-woman.jpg (8 MB → target <500 KB)
  - [ ] section-dock-woman.jpg (2.8 MB → target <500 KB)
  - [ ] section-joyful-woman.jpg (9.5 MB → target <500 KB)
  - [ ] section-senior-man.jpg (9.7 MB → target <500 KB)
- [ ] Lazy loading for images below the fold
- [ ] Code splitting for large features
- [ ] Test on 3G network simulation
- [ ] Test on low-end Android device (2GB RAM)
- [ ] Lighthouse performance score >80 on mobile

---

## 🧪 PHASE 7: TESTING & QUALITY ASSURANCE (Week 7-8)

### Automated Testing
- [ ] Unit tests for core business logic
- [ ] Integration tests for API endpoints
- [ ] E2E smoke tests:
  - [ ] Login/logout
  - [ ] Upload chat and get trust score
  - [ ] Upload photo and get verification
  - [ ] Purchase subscription (test mode)
  - [ ] Restore purchases
  - [ ] Generate PDF report
  - [ ] Enable Guardian Mode
  - [ ] Add FamilyLink contact

### Manual Device Testing Matrix
- [ ] **iOS Devices:**
  - [ ] iPhone SE (small screen)
  - [ ] iPhone 13/14 (standard)
  - [ ] iPhone 14 Pro Max (large screen)
  - [ ] iPad (if supporting tablets)
  - [ ] iOS 16, 17, 18 (latest)
- [ ] **Android Devices:**
  - [ ] Low-end device (2GB RAM, Android 10)
  - [ ] Mid-range device (4GB RAM, Android 12)
  - [ ] High-end device (8GB+ RAM, Android 14)
  - [ ] Tablet (if supporting tablets)
- [ ] **Test both light and dark modes on all devices**

### Edge Cases & Error Scenarios
- [ ] No network connection
- [ ] Slow network (3G simulation)
- [ ] Failed image analysis (API error)
- [ ] Oversized image upload (>10 MB)
- [ ] Unsupported file format
- [ ] Subscription edge states:
  - [ ] Trial → Paid conversion
  - [ ] Subscription paused (billing issue)
  - [ ] Grace period
  - [ ] Expired subscription
  - [ ] Refunded subscription
- [ ] Restore purchases on new device
- [ ] Multiple devices logged in simultaneously
- [ ] Account deletion while subscription active

### Crash Reporting & Analytics
- [ ] Integrate crash reporting (Crashlytics or Sentry)
- [ ] Configure PII redaction in crash reports
- [ ] Set up basic analytics events (opt-in where required):
  - [ ] App opened
  - [ ] Analysis completed
  - [ ] Subscription purchased
  - [ ] PDF generated
- [ ] Test crash reporting works on both platforms

---

## 🍎 PHASE 8: APPLE APP STORE SUBMISSION (Week 8-9)

### App Store Connect Setup
- [ ] Create app record in App Store Connect
- [ ] Set app name (max 30 characters)
- [ ] Set subtitle (max 30 characters)
- [ ] Choose primary category (Lifestyle or Social Networking)
- [ ] Choose secondary category (optional)
- [ ] Set content rights (you own or have rights to use)

### App Metadata
- [ ] Write app description (max 4,000 characters)
- [ ] Write promotional text (max 170 characters, updatable without review)
- [ ] Add keywords (max 100 characters, comma-separated)
- [ ] Set support URL (must be live)
- [ ] Set marketing URL (optional)
- [ ] Set privacy policy URL (must be live)
- [ ] Add copyright notice

### App Store Screenshots & Media
- [ ] iPhone 6.7" screenshots (required) - at least 3, up to 10
- [ ] iPhone 6.5" screenshots (required) - at least 3, up to 10
- [ ] iPhone 5.5" screenshots (optional but recommended)
- [ ] iPad Pro 12.9" screenshots (if supporting iPad)
- [ ] App preview video (optional, 15-30 seconds)
- [ ] All screenshots show actual app functionality (no mockups)

### In-App Purchase Configuration
- [ ] Add all subscription tiers to App Store Connect
- [ ] Write subscription display names and descriptions
- [ ] Add subscription screenshots (show value proposition)
- [ ] Set subscription review information

### App Review Information
- [ ] Provide demo account credentials (username + password)
- [ ] Write review notes explaining:
  - [ ] How to test chat analysis (provide sample scam text)
  - [ ] How to test photo verification (provide sample photo)
  - [ ] Where "Delete Account" button is located
  - [ ] Any features that require backend setup
- [ ] Provide contact information (phone + email)

### Build Submission
- [ ] Archive app in Xcode
- [ ] Upload to App Store Connect via Xcode or Transporter
- [ ] Wait for processing (10-30 minutes)
- [ ] Select build for submission
- [ ] Answer export compliance questions
- [ ] Submit for review

### TestFlight Testing (Before Submission)
- [ ] Add internal testers (up to 100)
- [ ] Distribute build via TestFlight
- [ ] Test all critical flows on real devices
- [ ] Fix any crashes or critical bugs
- [ ] Add external testers (optional, up to 10,000)
- [ ] Collect feedback and iterate

---

## 🤖 PHASE 9: GOOGLE PLAY STORE SUBMISSION (Week 8-9)

### Play Console Setup
- [ ] Create app in Play Console
- [ ] Set app name
- [ ] Set short description (max 80 characters)
- [ ] Set full description (max 4,000 characters)
- [ ] Choose app category (Dating or Lifestyle)
- [ ] Add tags (up to 5)
- [ ] Set contact email (must be visible)
- [ ] Set website URL
- [ ] Set privacy policy URL

### Store Listing Assets
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Phone screenshots (at least 2, up to 8)
- [ ] 7-inch tablet screenshots (optional)
- [ ] 10-inch tablet screenshots (optional)
- [ ] Promo video (YouTube URL, optional)

### App Content & Declarations
- [ ] Complete Data Safety form
- [ ] Complete Content Rating questionnaire (IARC)
- [ ] Set target audience (Teen 13+)
- [ ] Declare ads (if applicable)
- [ ] Set app access (all features available or restricted)
- [ ] Provide instructions for testing restricted features

### Release Configuration
- [ ] Set countries/regions for distribution
- [ ] Choose pricing (Free with in-app purchases)
- [ ] Configure in-app products (subscriptions)
- [ ] Set up release notes for first version

### Build Upload
- [ ] Generate signed AAB (Android App Bundle) in Android Studio
- [ ] Upload to Play Console (Production track or Internal testing)
- [ ] Wait for processing and security scan
- [ ] Review pre-launch report (automated testing results)
- [ ] Fix any critical issues found

### Testing Tracks
- [ ] Internal testing track (up to 100 testers)
- [ ] Closed testing track (optional, up to 100,000 testers)
- [ ] Open testing track (optional, unlimited)
- [ ] Test all critical flows
- [ ] Staged rollout plan (start with 5%, then 10%, 25%, 50%, 100%)

---

## 🌐 PHASE 10: DOMAIN & INFRASTRUCTURE (Week 9-10)

### Domain Configuration
- [ ] Connect production domain to Vercel
- [ ] Configure DNS records (A, AAAA, CNAME)
- [ ] Set up www → non-www redirect (or vice versa)
- [ ] Verify HTTPS certificate is active
- [ ] Test domain loads correctly on mobile browsers

### Email Setup
- [ ] Set up support@yourdomain.com
- [ ] Set up privacy@yourdomain.com
- [ ] Set up legal@yourdomain.com
- [ ] Set up noreply@yourdomain.com (for transactional emails)
- [ ] Configure SPF, DKIM, DMARC records
- [ ] Test email delivery

### Deep Linking
- [ ] Configure Apple Universal Links
  - [ ] Create apple-app-site-association file
  - [ ] Host at https://yourdomain.com/.well-known/apple-app-site-association
  - [ ] Add associated domains entitlement in Xcode
  - [ ] Test universal links open app
- [ ] Configure Android App Links
  - [ ] Create assetlinks.json file
  - [ ] Host at https://yourdomain.com/.well-known/assetlinks.json
  - [ ] Add intent filters in AndroidManifest.xml
  - [ ] Test app links open app

### Monitoring & Alerting
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, or similar)
- [ ] Configure alerts for:
  - [ ] API downtime
  - [ ] High error rates (>5%)
  - [ ] Database connection failures
  - [ ] Payment webhook failures
- [ ] Set up log aggregation (if not using Vercel logs)
- [ ] Configure error tracking (Sentry or similar)

### Database & Backups
- [ ] Verify PostgreSQL backups are running (daily minimum)
- [ ] Test database restore procedure
- [ ] Document backup retention policy (recommend 30 days)
- [ ] Set up database monitoring (connection pool, query performance)

---

## 📞 PHASE 11: SUPPORT & OPERATIONS (Week 10-11)

### Support Infrastructure
- [ ] Create Help Center / FAQ page
- [ ] Write support articles:
  - [ ] How to analyze a chat
  - [ ] How to verify a photo
  - [ ] How to generate a PDF report
  - [ ] How to enable Guardian Mode
  - [ ] How to add FamilyLink contacts
  - [ ] How to manage subscription
  - [ ] How to cancel subscription
  - [ ] How to delete account
  - [ ] How to request refund
- [ ] Set up support ticket system (Zendesk, Intercom, or email)
- [ ] Create support response templates
- [ ] Define support SLAs by tier (per SUBSCRIPTION_TIERS.md)

### Crisis Resources
- [ ] Compile list of crisis hotlines by country
- [ ] Add links to victim support organizations
- [ ] Create "Safety Planning" resource page
- [ ] Add "Report to Law Enforcement" guidance

### Incident Response
- [ ] Create security incident response playbook
- [ ] Define breach notification timeline (72 hours for GDPR)
- [ ] List emergency contacts (technical, legal, PR)
- [ ] Document escalation procedures

---

## 🚀 PHASE 12: PRE-LAUNCH FINAL CHECKS (Week 11-12)

### Final Testing
- [ ] Full regression test on production environment
- [ ] Test all payment flows with real cards (small amounts)
- [ ] Test subscription cancellation and refund
- [ ] Verify all emails are sending correctly
- [ ] Test password reset flow
- [ ] Test account deletion flow
- [ ] Verify all links in app work (support, privacy, terms)
- [ ] Test on both iOS and Android one final time

### Content Review
- [ ] Proofread all in-app text for typos
- [ ] Verify all legal documents are up to date
- [ ] Check all URLs are correct and live
- [ ] Verify contact emails are monitored
- [ ] Review app store screenshots for accuracy

### Compliance Final Check
- [ ] Privacy Policy reviewed by legal counsel (recommended)
- [ ] Terms of Service reviewed by legal counsel (recommended)
- [ ] App Privacy labels match actual data collection
- [ ] Data Safety form matches actual data handling
- [ ] Age rating is appropriate for content
- [ ] All required disclosures are present

### Launch Readiness
- [ ] All team members trained on support procedures
- [ ] Monitoring and alerting tested and working
- [ ] Backup and restore procedures documented
- [ ] Incident response plan reviewed
- [ ] Press kit prepared (if doing PR)
- [ ] Social media accounts ready (if applicable)
- [ ] Launch announcement drafted

---

## 📊 POST-LAUNCH (Week 12+)

### Week 1 After Launch
- [ ] Monitor crash reports daily
- [ ] Monitor app reviews and respond
- [ ] Monitor support tickets and response times
- [ ] Track key metrics:
  - [ ] Downloads
  - [ ] Active users
  - [ ] Subscription conversions
  - [ ] Churn rate
  - [ ] Average trust score
- [ ] Fix any critical bugs immediately

### Week 2-4 After Launch
- [ ] Analyze user feedback and reviews
- [ ] Prioritize feature requests
- [ ] Plan first update (bug fixes + small improvements)
- [ ] Continue monitoring metrics
- [ ] Optimize conversion funnel based on data

### Ongoing
- [ ] Monthly security updates
- [ ] Quarterly feature releases
- [ ] Annual privacy policy review
- [ ] Annual terms of service review
- [ ] Continuous performance monitoring
- [ ] Regular user research and feedback collection

---

## ⚠️ CRITICAL WARNINGS

### Apple Rejection Risks
1. **No "Delete Account" button** → Automatic rejection
2. **Directing users to Stripe for IAP** → Automatic rejection
3. **Missing Sign in with Apple** (if using Google/Facebook) → Automatic rejection
4. **Incomplete App Privacy labels** → Rejection
5. **"Coming soon" features in submitted app** → Rejection
6. **Demo account doesn't work** → Rejection

### Google Play Rejection Risks
1. **Incomplete Data Safety form** → Rejection
2. **Missing privacy policy** → Rejection
3. **Inappropriate content rating** → Rejection
4. **Broken core functionality** → Rejection

### Security Risks
1. **Large uncompressed images (2-13 MB)** → Poor performance, user complaints
2. **No rate limiting** → API abuse, high costs
3. **Secrets in code** → Security breach
4. **No PII encryption** → Compliance violation, breach risk

### Business Risks
1. **No unified entitlements service** → Subscription chaos across platforms
2. **No receipt validation** → Fraud, revenue loss
3. **No webhook handling** → Subscriptions out of sync
4. **No usage tracking** → Can't enforce tier limits

---

## 📝 NOTES & RECOMMENDATIONS

### Timeline Estimate
- **Minimum:** 10-12 weeks (if everything goes smoothly)
- **Realistic:** 14-16 weeks (accounting for reviews, iterations, rejections)
- **Conservative:** 18-20 weeks (if building native features or complex IAP)

### Budget Estimate
- Apple Developer: $99/year
- Google Play: $25 one-time
- Domain: $10-50/year
- SSL Certificate: Free (Let's Encrypt via Vercel)
- Stripe fees: 2.9% + $0.30 per transaction
- Apple IAP fees: 15-30% (15% after year 1 or <$1M revenue)
- Google Play fees: 15-30% (15% after year 1 or <$1M revenue)
- Hosting (Vercel): $20-100/month (depending on usage)
- Database (PostgreSQL): $20-100/month
- Monitoring/Analytics: $0-50/month
- **Total first year:** ~$2,000-5,000 (excluding revenue share)

### Priority Order
1. **Mobile packaging decision** (Capacitor vs React Native)
2. **Payment strategy** (Stripe + IAP integration)
3. **Account deletion** (required by Apple)
4. **Legal documents** (Privacy, Terms, Disclaimers)
5. **Image compression** (critical for performance)
6. **Testing on real devices**
7. **App store submissions**

---

## ✅ COMPLETION CRITERIA

You are ready to launch when:
- [ ] All items in Phases 1-11 are checked off
- [ ] App approved by Apple App Store
- [ ] App approved by Google Play Store
- [ ] All payment flows tested and working
- [ ] All legal documents live and linked
- [ ] Support infrastructure ready
- [ ] Monitoring and alerting active
- [ ] Team trained and ready

---

**Questions or need help with any item? Contact the development team.**

**Last Updated:** November 19, 2025
