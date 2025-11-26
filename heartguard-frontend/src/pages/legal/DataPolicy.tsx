import React from "react";

export default function DataPolicy() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Data Retention & Deletion Policy</h1>

      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

      <p className="mt-4">
        This policy explains how long HeartGuard keeps your data and how deletion works.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">Retention Periods</h2>
      <ul className="list-disc ml-6">
        <li>Uploaded Photos — 30 days</li>
        <li>Chat/Text Analysis — 90 days</li>
        <li>Account Data — until you delete your account</li>
        <li>Billing Records — 7 years (legal requirement)</li>
      </ul>

      <h2 className="font-semibold text-xl mt-6 mb-2">Deleting Your Data</h2>
      <p>
        You can delete your account anytime from the Account Settings page. This permanently
        deletes all photos, chats, reports, and history.
      </p>

      <h2 className="font-semibold text-xl mt-6 mb-2">Contact</h2>
      <p>Email: support@heartguard.me</p>
    </div>
  );
}
