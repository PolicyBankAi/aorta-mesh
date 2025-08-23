import React from "react";
import { useConsent } from "../../hooks/useConsent"; // ✅ correct relative path
/**
 * ConsentManager Component
 * ------------------------
 * - Displays user consents
 * - Allows recording and withdrawing consents
 * - Intended for embedding in account/settings UI
 */
export const ConsentManager = ({ userId }) => {
    const { consents, loading, giveConsent, withdrawConsent } = useConsent(userId);
    // ✅ Guard: No userId provided
    if (!userId) {
        return (<div className="p-4 border rounded-lg shadow bg-red-50 text-red-700">
        <p>User ID is required to manage consents.</p>
      </div>);
    }
    // ✅ Loading state
    if (loading) {
        return (<div className="p-4 border rounded-lg shadow bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-300 animate-pulse">
          Loading consents...
        </p>
      </div>);
    }
    return (<div className="p-4 border rounded-lg shadow bg-white dark:bg-gray-900">
      <h2 className="text-lg font-bold mb-4">User Consents</h2>

      {/* ✅ Action button to give GDPR consent */}
      <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition" onClick={() => giveConsent("gdpr_data_processing")}>
        Accept GDPR Consent
      </button>

      {/* ✅ Consent list */}
      <ul className="mt-4 space-y-2">
        {consents.length === 0 ? (<li className="text-gray-500 italic">No consents recorded yet.</li>) : (consents.map((c) => (<li key={c.id} className="flex justify-between items-center p-2 border rounded bg-gray-50 dark:bg-gray-800">
              <span>
                <span className="font-medium">{c.consent_type}</span> —{" "}
                {c.withdrawn ? (<span className="text-red-500">Withdrawn</span>) : (<span className="text-green-600">Active</span>)}
              </span>
              {!c.withdrawn && (<button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition" onClick={() => withdrawConsent(c.id)}>
                  Withdraw
                </button>)}
            </li>)))}
      </ul>
    </div>);
};
