/**
 * Data Retention & Deletion Policy Page
 */

export function DataPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 prose prose-slate">
      <h1>Data Retention & Deletion Policy</h1>
      <p className="text-sm text-muted-foreground">Last Updated: November 25, 2025</p>

      <h2>Overview</h2>
      <p>
        This policy explains how long we retain your data and how you can request deletion of
        your information from HeartGuard.
      </p>

      <h2>Data Retention Periods</h2>
      
      <h3>Account Data</h3>
      <ul>
        <li><strong>Active Accounts:</strong> Retained for the duration of your account</li>
        <li><strong>Inactive Accounts:</strong> Deleted after 2 years of inactivity</li>
        <li><strong>Deleted Accounts:</strong> Permanently removed within 30 days</li>
      </ul>

      <h3>Analysis Data</h3>
      <ul>
        <li><strong>Free Plan:</strong> 30 days retention</li>
        <li><strong>Basic Plan:</strong> 6 months retention</li>
        <li><strong>Plus Plan:</strong> 12 months retention</li>
        <li><strong>Family Plan:</strong> Unlimited retention while subscribed</li>
      </ul>

      <h3>Payment Data</h3>
      <ul>
        <li><strong>Transaction Records:</strong> 7 years (legal requirement)</li>
        <li><strong>Payment Methods:</strong> Stored securely by Stripe, not by us</li>
      </ul>

      <h3>Backup Data</h3>
      <ul>
        <li><strong>Encrypted Backups:</strong> 90 days rolling retention</li>
        <li><strong>Disaster Recovery:</strong> Deleted after account deletion</li>
      </ul>

      <h2>Data Deletion</h2>

      <h3>How to Delete Your Data</h3>
      <p>You can delete your data in the following ways:</p>
      <ol>
        <li>
          <strong>Self-Service Deletion:</strong> Go to Account Settings → Delete Account.
          This will permanently delete your account and all associated data within 30 days.
        </li>
        <li>
          <strong>Email Request:</strong> Send a deletion request to privacy@heartguard.app
          with your account email. We will process your request within 30 days.
        </li>
        <li>
          <strong>Individual Analysis Deletion:</strong> Delete specific analyses from your
          report history at any time.
        </li>
      </ol>

      <h3>What Gets Deleted</h3>
      <p>When you delete your account, we permanently remove:</p>
      <ul>
        <li>Your profile and account information</li>
        <li>All chat and photo analyses</li>
        <li>Trust scores and risk assessments</li>
        <li>Guardian Mode and FamilyLink data</li>
        <li>Evidence Locker PDFs</li>
        <li>Usage history and preferences</li>
      </ul>

      <h3>What We Retain</h3>
      <p>For legal and security reasons, we may retain:</p>
      <ul>
        <li>Transaction records (7 years for tax compliance)</li>
        <li>Fraud detection logs (1 year for security)</li>
        <li>Aggregated, anonymized analytics data</li>
      </ul>

      <h2>Data Portability</h2>
      <p>
        Before deleting your account, you can export your data:
      </p>
      <ul>
        <li>Download all your analysis reports as PDFs</li>
        <li>Export your account data as JSON</li>
        <li>Request a complete data archive via email</li>
      </ul>

      <h2>Automatic Deletion</h2>
      <p>We automatically delete:</p>
      <ul>
        <li>Expired analyses based on your subscription tier</li>
        <li>Temporary files after 24 hours</li>
        <li>Session data after logout</li>
        <li>Inactive accounts after 2 years</li>
      </ul>

      <h2>Third-Party Data</h2>
      <p>
        Data stored by third-party services (like Stripe) is subject to their retention policies.
        We will request deletion from third parties when you delete your account, but cannot
        guarantee immediate removal from their systems.
      </p>

      <h2>Legal Holds</h2>
      <p>
        In rare cases, we may be legally required to retain data beyond normal retention periods
        due to litigation, investigations, or regulatory requirements.
      </p>

      <h2>Questions About Data Deletion</h2>
      <p>
        If you have questions about data retention or deletion, contact us at:
        <br />
        Email: privacy@heartguard.app
      </p>
    </div>
  );
}
