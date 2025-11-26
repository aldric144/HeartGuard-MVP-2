import React from "react";

export default function ReportScam() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Report a Scam</h1>

      <p>
        If you believe you are a victim of fraud, please contact your local authorities.
        You may also report scams to:
      </p>

      <ul className="list-disc ml-6 mt-4">
        <li>IC3.gov (FBI Internet Crime Center)</li>
        <li>FTC.gov/complaint</li>
        <li>Your local police department</li>
      </ul>

      <p className="mt-4">
        You can also send optional details to help improve HeartGuard's global intelligence.
      </p>
    </div>
  );
}
