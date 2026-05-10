import { useCallback, useEffect, useState } from "react";
import {
  clearBearerToken,
  directGet,
  getBearerToken,
  loginUrl,
  logout as ctfdLogout,
  mintBearerFromSession,
} from "@/lib/ctfdClient";

export interface User {
  id: number;
  name: string;
  email?: string;
  team_id?: number | null;
  oauth_id?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const loadUser = useCallback(async () => {
    if (!getBearerToken()) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    try {
      const json = await directGet<{ success: boolean; data: User }>("/users/me");
      if (!json.success) throw new Error("not authenticated");
      setState({ user: json.data, loading: false, error: null });
    } catch (e) {
      clearBearerToken();
      setState({
        user: null,
        loading: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback((returnTo: string = "/") => {
    window.location.href = loginUrl(returnTo);
  }, []);

  const logout = useCallback(async () => {
    await ctfdLogout();
    setState({ user: null, loading: false, error: null });
  }, []);

  const completeOAuth = useCallback(async () => {
    // Called from /login/callback after CTFd has set the session cookie
    await mintBearerFromSession();
    await loadUser();
  }, [loadUser]);

  return {
    ...state,
    isAuthenticated: !!state.user,
    login,
    logout,
    completeOAuth,
    refresh: loadUser,
  };
}
