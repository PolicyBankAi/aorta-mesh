import React from "react";
import { useConsent } from "../../hooks/useConsent";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ConsentManagerProps {
  userId: string;
  availableConsents?: string[]; // NEW: allow different consent types (GDPR, HIPAA, Research, etc.)
}

/**
 * ConsentManager Component
 * ------------------------
 * - Displays and manages user consents (HIPAA, GDPR, Research)
 * - Allows granting and withdrawing consents
 * - Provides audit trail hooks for compliance
 */
export const ConsentManager: React.FC<ConsentManagerProps> = ({
  userId,
  availableConsents = ["gdpr_data_processing", "hipaa_authorization"],
}) => {
  const { consents, loading, giveConsent, withdrawConsent } = useConsent(userId);

  // Guard: No userId provided
  if (!userId) {
    return (
      <div className="p-4 border border-red-400 rounded-lg shadow bg-red-50 text-red-700">
        <p>User ID is required to manage consents.</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 border border-cyan-400 rounded-lg shadow bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-300 animate-pulse">
          Loading consents...
        </p>
      </div>
    );
  }

  // Handler with error + audit feedback
  const handleGiveConsent = async (type: string) => {
    try {
      await giveConsent(type);
      toast({ title: "Consent Recorded", description: `Granted: ${type}` });
      // TODO: POST to /api/audit-log { userId, action: "consent_granted", type }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Consent failed." });
    }
  };

  const handleWithdrawConsent = async (id: string, type: string) => {
    try {
      await withdrawConsent(id);
      toast({ title: "Consent Withdrawn", description: `Revoked: ${type}` });
      // TODO: POST to /api/audit-log { userId, action: "consent_withdrawn", type }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Withdrawal failed." });
    }
  };

  return (
    <div className="p-4 border border-cyan-400 rounded-lg shadow bg-white dark:bg-gray-900">
      <h2 className="text-lg font-bold mb-4 text-cyan-400">User Consents</h2>
      <p className="text-sm text-cyan-300 mb-4">
        Consents determine how personal and medical data can be processed. Users may revoke consent at any time.
      </p>

      {/* Available consents to grant */}
      <div className="space-y-2">
        {availableConsents.map((type) => (
          <Button
            key={type}
            className="bg-green-600 hover:bg-green-700 text-white w-full justify-start"
            onClick={() => handleGiveConsent(type)}
            aria-label={`Give consent for ${type}`}
          >
            Grant {type.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      {/* Consent list */}
      <ul className="mt-6 space-y-2">
        {consents.length === 0 ? (
          <li className="text-gray-500 italic">No consents recorded yet.</li>
        ) : (
          consents.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-center p-2 border border-cyan-400 rounded bg-gray-50 dark:bg-gray-800"
            >
              <span>
                <span className="font-medium">{c.consent_type}</span> —{" "}
                {c.withdrawn ? (
                  <span className="text-red-500">Withdrawn</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </span>
              {!c.withdrawn && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleWithdrawConsent(c.id, c.consent_type)}
                  aria-label={`Withdraw consent for ${c.consent_type}`}
                >
                  Withdraw
                </Button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
