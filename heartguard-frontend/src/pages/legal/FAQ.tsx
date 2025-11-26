import React from "react";

export default function FAQ() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

      <h2 className="font-semibold text-lg mt-6">What does HeartGuard do?</h2>
      <p>HeartGuard analyzes chats, photos, and behavior patterns to detect romance scams.</p>

      <h2 className="font-semibold text-lg mt-6">Is HeartGuard a background check?</h2>
      <p>No. HeartGuard only analyzes information you provide.</p>

      <h2 className="font-semibold text-lg mt-6">Do you store my photos?</h2>
      <p>Only temporarily, for analysis. Photos auto-delete in 30 days.</p>

      <h2 className="font-semibold text-lg mt-6">Is my information private?</h2>
      <p>Yes. Everything is encrypted and never shared with third parties.</p>
    </div>
  );
}
