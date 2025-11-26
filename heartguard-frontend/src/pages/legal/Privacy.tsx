import React from "react";

export default function Privacy() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

      <p className="mt-4">
        HeartGuard™ ("we," "our," "the Company") is committed to protecting your privacy.
        This policy explains how we collect, use, and protect your information.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc ml-6">
        <li>Name or alias you enter for evaluations</li>
        <li>Email address for account creation</li>
        <li>Uploaded photos (for verification)</li>
        <li>Chat text for analysis</li>
        <li>PDF reports you generate</li>
        <li>IP address, browser/device info</li>
      </ul>

      <h2 className="font-semibold text-xl mt-6 mb-2">2. How We Use Information</h2>
      <ul className="list-disc ml-6">
        <li>Generate trust scores</li>
        <li>Detect scam patterns and emotional manipulation</li>
        <li>Provide Guardian Mode™ alerts</li>
        <li>Improve the detection models</li>
        <li>Maintain subscriptions and account access</li>
      </ul>

      <h2 className="font-semibold text-xl mt-6 mb-2">3. Data Protection</h2>
      <p>
        HeartGuard uses encryption, secure databases, strict access control, and SHA-256 verification
        to protect your data.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">4. Data Retention</h2>
      <p>
        Data is retained only as long as needed. You may request deletion anytime.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">5. Contact</h2>
      <p>Email: support@heartguard.me</p>
    </div>
  );
}
