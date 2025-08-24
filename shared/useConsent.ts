import { useState } from "react";

export interface Consent {
  id: string;
  userId: string;
  consentType: string;
  withdrawn: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export function useConsent(initialConsents: Consent[] = []) {
  const [consents, setConsents] = useState<Consent[]>(initialConsents);

  function grantConsent(userId: string, consentType: string) {
    const newConsent: Consent = {
      id: crypto.randomUUID(),
      userId,
      consentType,
      withdrawn: false,
      createdAt: new Date(),
    };
    setConsents((prev) => [...prev, newConsent]);
  }

  function withdrawConsent(consentId: string) {
    setConsents((prev) =>
      prev
        .map((c) =>
          c.id === consentId ? { ...c, withdrawn: true, updatedAt: new Date() } : c
        )
        // ✅ Filter out any accidental undefineds
        .filter((c): c is Consent => Boolean(c))
    );
  }

  function hasConsent(userId: string, consentType: string): boolean {
    return consents.some(
      (c) => c.userId === userId && c.consentType === consentType && !c.withdrawn
    );
  }

  return { consents, grantConsent, withdrawConsent, hasConsent };
}

