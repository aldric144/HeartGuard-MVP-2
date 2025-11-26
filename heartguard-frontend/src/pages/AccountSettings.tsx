import React from "react";

export default function AccountSettings() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <p>Update your profile, change your password, manage your subscription, or delete your account permanently.</p>

      <ul className="list-disc ml-6 mt-4">
        <li>Update Email</li>
        <li>Change Password</li>
        <li>Manage Subscription</li>
        <li>Delete Account</li>
      </ul>
    </div>
  );
}
