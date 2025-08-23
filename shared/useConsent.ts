import { useState, useEffect } from "react";

export type Consent = {
  id: string;
  user_id: string;
  consent_type: string;
  timestamp: string;
  withdrawn: boolean;
};

export function useConsent(userId: string) {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/consents?user_id=${userId}`);
        const data = await res.json();
        setConsents(data);
      } catch (err) {
        console.error("Failed to fetch consents", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const giveConsent = async (consentType: string) => {
    try {
      const res = await fetch("/api/consents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, consent_type: consentType }),
      });
      const newConsent = await res.json();
      setConsents([...consents, newConsent]);
    } catch (err) {
      console.error("Failed to give consent", err);
    }
  };

  const withdrawConsent = async (consentId: string) => {
    try {
      await fetch(`/api/consents/${consentId}`, { method: "DELETE" });
      setConsents(consents.map(c => c.id === consentId ? { ...c, withdrawn: true } : c));
    } catch (err) {
      console.error("Failed to withdraw consent", err);
    }
  };

  return { consents, loading, giveConsent, withdrawConsent };
}
