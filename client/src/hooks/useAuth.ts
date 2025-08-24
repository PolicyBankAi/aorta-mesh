import { useState, useEffect } from "react"; // ✅ Import React hooks

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // 🔐 Simulated async auth check (replace with real API or SDK call)
    const timer = setTimeout(() => {
      setUser({ id: "123", email: "test@example.com", role: "admin" }); // Replace with actual user data
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { isLoading, isAuthenticated, user };
}
