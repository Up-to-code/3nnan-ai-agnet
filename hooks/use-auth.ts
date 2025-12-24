"use client";

/**
 * useAuth Hook
 * Provides auth state and actions for the frontend
 */

import { useSession, signIn, signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      }
    : null;

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        console.error("Login error:", result.error);
        return false;
      }

      router.push("/chat/new");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, [router]);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/chat/new",
      });
    } catch (error) {
      console.error("Google login error:", error);
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const { signUp } = await import("@/lib/auth/client");
      
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        console.error("Register error:", result.error);
        return false;
      }

      router.push("/chat/new");
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
  };
}

export default useAuth;

