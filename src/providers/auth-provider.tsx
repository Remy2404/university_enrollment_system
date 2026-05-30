"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/client";
import { userService } from "@/src/services/user";
import type { User } from "@/src/types";

interface SignUpInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuthUser = useCallback(async (authUser: AuthUser | null) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setUser(await userService.getByAuthUser(authUser));
      setError(null);
    } catch (loadError) {
      setUser(null);
      setError(loadError instanceof Error ? loadError.message : "Failed to load account profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = createClient();
      void supabase.auth.getUser().then(({ data }) => {
        if (isMounted) void loadAuthUser(data.user);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => {
          if (isMounted) void loadAuthUser(session?.user ?? null);
        }, 0);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch (configError) {
      queueMicrotask(() => {
        if (!isMounted) return;
        setError(configError instanceof Error ? configError.message : "Supabase is not configured.");
        setLoading(false);
      });
    }
  }, [loadAuthUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const signedInUser = await userService.signIn(email, password);
    setUser(signedInUser);
    setError(null);
    return signedInUser;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    await userService.registerStudent(input);
  }, []);

  const signOut = useCallback(async () => {
    await userService.signOut();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const refreshed = await userService.getCurrent();
    setUser(refreshed);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, signIn, signUp, signOut, refreshProfile }),
    [error, loading, refreshProfile, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
