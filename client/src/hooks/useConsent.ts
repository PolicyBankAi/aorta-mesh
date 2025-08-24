import { useState, useEffect, useCallback } from "react";

interface Consent {
  id: string;
  user_id: string;
  consent_type: string;
  withdrawn: boolean;
  timestamp: string;
}

export function useConsent(userId: string) {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all consents for this user
  const fetchConsents = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/consents?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Failed to fetch consents");
      const data: Consent[] = await res.json();
      setConsents(data);
    } catch (err) {
      console.error("❌ Error fetching consents:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ✅ Record a new consent
  const giveConsent = useCallback(
    async (consentType: string) => {
      try {
        const res = await fetch(`/api/consents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, consent_type: consentType }),
        });
        if (!res.ok) throw new Error("Failed to record consent");
        await fetchConsents(); // refresh list
      } catch (err) {
        console.error("❌ Error giving consent:", err);
      }
    },
    [userId, fetchConsents]
  );

  // ✅ Withdraw consent
  const withdrawConsent = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/consents/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to withdraw consent");
        await fetchConsents(); // refresh list
      } catch (err) {
        console.error("❌ Error withdrawing consent:", err);
      }
    },
    [fetchConsents]
  );

  // 🔄 Load consents on mount / when userId changes
  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  return { consents, loading, giveConsent, withdrawConsent, refresh: fetchConsents };
}

