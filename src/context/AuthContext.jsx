import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { login as apiLogin, logout as apiLogout } from "../services/authService";

/**
 * AuthContext
 *
 * Provides:
 *   - user        : object | null   — logged-in user { id, name, email, role, region_id }
 *   - token       : string | null   — JWT token
 *   - isLoggedIn  : boolean
 *   - loading     : boolean         — true while a login/logout request is in-flight
 *   - error       : string | null   — last auth error message
 *   - login(email, password)        — calls API, persists token & user to localStorage
 *   - logout()                      — calls API, clears localStorage state
 */

const AuthContext = createContext(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLocalUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem("token"));
  const [user, setUser]     = useState(readLocalUser);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  /**
   * Login handler.
   * On success stores token + user in both state and localStorage.
   * Returns the user object so callers can redirect based on role.
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiLogin(email, password);

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      const { token: newToken, user: newUser } = result.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setSessionExpired(false);

      return newUser;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout handler.
   * Calls the logout endpoint (best-effort — clears local state regardless).
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch {
      // Server-side logout failure is non-fatal; clear client state anyway
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setSessionExpired(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setError("Your session has expired. Please log in again.");
      setSessionExpired(true);
    };

    window.addEventListener("auth:expired", handleSessionExpired);
    return () => window.removeEventListener("auth:expired", handleSessionExpired);
  }, []);

  const value = {
    user,
    token,
    isLoggedIn: Boolean(token),
    loading,
    error,
    login,
    logout,
    sessionExpired,
    dismissSessionExpired: () => {
      setSessionExpired(false);
      setError(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAuth — consume the AuthContext anywhere in the tree.
 * @returns {{ user, token, isLoggedIn, loading, error, login, logout }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

export default AuthContext;
