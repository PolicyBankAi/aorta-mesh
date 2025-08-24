import { useState, useEffect, useCallback } from "react";

export type Consent = {
  id: string;
  user_id: string;
  consent_type: string;
  timestamp: string;
  withdrawn: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function useConsent(userId: string) {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsents = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/consents?user_id=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) throw new Error(`Failed to fetch consents: ${res.statusText}`);

      const data: Consent[] = await res.json();
      setConsents(data);
    } catch (err: any) {
      console.error("Error fetching consents:", err);
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  const giveConsent = useCallback(
    async (consentType: string) => {
      try {
        setError(null);
        const res = await fetch("/api/consents", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ user_id: userId, consent_type: consentType }),
        });

        if (!res.ok) throw new Error(`Failed to give consent: ${res.statusText}`);

        const response: ApiResponse<Consent> = await res.json();

        if (!response.success || !response.data) {
          throw new Error(response.error || "Unknown error giving consent.");
        }

        setConsents((prev) => [...prev, response.data]);
      } catch (err: any) {
        console.error("Error giving consent:", err);
        setError(err.message || "Unexpected error occurred.");
      }
    },
    [userId]
  );

  const withdrawConsent = useCallback(
    async (consentId: string) => {
      try {
        setError(null);
        const res = await fetch(`/api/consents/${encodeURIComponent(consentId)}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`Failed to withdraw consent: ${res.statusText}`);

        setConsents((prev) =>
          prev.map((c) => (c.id === consentId ? { ...c, withdrawn: true } : c))
        );
      } catch (err: any) {
        console.error("Error withdrawing consent:", err);
        setError(err.message || "Unexpected error occurred.");
      }
    },
    []
  );

  return { consents, loading, error, giveConsent, withdrawConsent, refresh: fetchConsents };
}
