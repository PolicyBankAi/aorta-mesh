import { useState, useEffect } from "react"; // ✅ Import React hooks

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

export function useAuth() {
  // Example: adjust this to match your real auth system
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Simulate auth fetch
    setTimeout(() => {
      setUser({ id: "123", email: "test@example.com", role: "admin" }); // replace with real auth
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 500);
  }, []);

  return { isLoading, isAuthenticated, user };
}
