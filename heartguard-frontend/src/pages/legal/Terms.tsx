import React from "react";

export default function Terms() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>

      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

      <p className="mt-4">
        By using HeartGuard™, you agree to these Terms. HeartGuard provides informational
        safety analysis only and is not a background check service.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">Eligibility</h2>
      <p>You must be 18 years or older to use HeartGuard.</p>

      <h2 className="font-semibold text-xl mt-6 mb-2">Subscription & Billing</h2>
      <p>
        Subscriptions renew automatically unless canceled. Billing is processed securely
        through Stripe.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">Limitation of Liability</h2>
      <p>
        HeartGuard does not guarantee prevention of all scams and is not liable for decisions
        users make based on the analysis.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">Contact</h2>
      <p>Email: support@heartguard.me</p>
    </div>
  );
}
