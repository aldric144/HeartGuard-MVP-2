/**
 * Terms of Use Page
 */

export function Terms() {
  return (
    <div className="max-w-4xl mx-auto p-6 prose prose-slate">
      <h1>Terms of Use</h1>
      <p className="text-sm text-muted-foreground">Last Updated: November 25, 2025</p>

      <h2>Acceptance of Terms</h2>
      <p>
        By accessing and using HeartGuard, you accept and agree to be bound by these Terms of Use.
        If you do not agree to these terms, please do not use our service.
      </p>

      <h2>Description of Service</h2>
      <p>
        HeartGuard provides AI-powered safety analysis tools to help users identify potential romance
        scams, emotional manipulation, and fake online relationships. Our service analyzes chat messages
        and photos to provide risk assessments and safety recommendations.
      </p>

      <h2>User Responsibilities</h2>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Maintain the security of your account credentials</li>
        <li>Use the service only for lawful purposes</li>
        <li>Not share your account with others</li>
        <li>Not attempt to circumvent security measures</li>
        <li>Not use the service to harass or harm others</li>
      </ul>

      <h2>Subscription and Billing</h2>
      <p>
        Paid subscriptions are billed monthly or annually through Stripe. You can cancel your
        subscription at any time through your account settings. Cancellations take effect at the
        end of the current billing period.
      </p>

      <h3>Free Trial</h3>
      <p>
        New users receive one free safety check (chat or photo analysis). After using your free
        check, you must subscribe to continue using the service.
      </p>

      <h3>Refund Policy</h3>
      <p>
        We offer refunds within 14 days of purchase if you are not satisfied with our service.
        Contact support@heartguard.app to request a refund.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        HeartGuard is provided "as is" without warranties of any kind. While we strive for accuracy,
        our AI analysis is not infallible and should not be your sole basis for making decisions.
      </p>

      <p className="font-semibold">
        IMPORTANT: HeartGuard is a safety tool, not a guarantee. Always use your own judgment and
        consider multiple sources of information when making decisions about relationships.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        HeartGuard and its affiliates shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages resulting from your use of the service.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content, features, and functionality of HeartGuard are owned by us and protected by
        copyright, trademark, and other intellectual property laws.
      </p>

      <h2>User Content</h2>
      <p>
        You retain ownership of content you submit for analysis. By using our service, you grant
        us a limited license to process your content for the purpose of providing our services and
        improving our AI models.
      </p>

      <h2>Termination</h2>
      <p>
        We reserve the right to terminate or suspend your account at any time for violation of
        these terms or for any other reason at our discretion.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We may modify these Terms of Use at any time. Continued use of the service after changes
        constitutes acceptance of the new terms.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the United
        States, without regard to conflict of law provisions.
      </p>

      <h2>Contact Information</h2>
      <p>
        For questions about these Terms of Use, contact us at:
        <br />
        Email: legal@heartguard.app
      </p>
    </div>
  );
}
