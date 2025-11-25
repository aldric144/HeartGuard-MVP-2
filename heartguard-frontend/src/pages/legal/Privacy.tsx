/**
 * Privacy Policy Page
 */

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-6 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last Updated: November 25, 2025</p>

      <h2>Introduction</h2>
      <p>
        HeartGuard ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information when you use our web application.
      </p>

      <h2>Information We Collect</h2>
      <h3>Personal Information</h3>
      <p>We may collect personal information that you voluntarily provide to us, including:</p>
      <ul>
        <li>Email address</li>
        <li>Account credentials</li>
        <li>Payment information (processed securely through Stripe)</li>
        <li>Communication preferences</li>
      </ul>

      <h3>Usage Data</h3>
      <p>We automatically collect certain information when you use our service:</p>
      <ul>
        <li>Chat messages and photos you analyze (encrypted and stored securely)</li>
        <li>Analysis results and trust scores</li>
        <li>Device information and browser type</li>
        <li>IP address and location data (for fraud detection)</li>
        <li>Usage patterns and feature interactions</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide and improve our safety analysis services</li>
        <li>Process your subscription payments</li>
        <li>Send you important updates and security alerts</li>
        <li>Detect and prevent fraud and scams</li>
        <li>Comply with legal obligations</li>
        <li>Improve our AI models and detection accuracy</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your data, including:
      </p>
      <ul>
        <li>End-to-end encryption for sensitive data</li>
        <li>Secure data storage with access controls</li>
        <li>Regular security audits and updates</li>
        <li>PCI-compliant payment processing through Stripe</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We retain your data for as long as your account is active or as needed to provide services.
        You can request deletion of your data at any time through your account settings.
      </p>

      <h2>Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Export your data</li>
        <li>Opt-out of marketing communications</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul>
        <li>Stripe for payment processing</li>
        <li>Cloud hosting providers for data storage</li>
        <li>Analytics services for usage tracking</li>
      </ul>

      <h2>Children's Privacy</h2>
      <p>
        Our service is not intended for users under 18 years of age. We do not knowingly collect
        information from children under 18.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page and updating the "Last Updated" date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at:
        <br />
        Email: privacy@heartguard.app
      </p>
    </div>
  );
}
