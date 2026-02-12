import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  hydrate: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    // Persist user data to localStorage
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  },

  // Logout keeps data in localStorage - only updates auth state
  logout: () => {
    set({ isAuthenticated: false });
    console.log("✓ User logged out (data preserved in localStorage)");
  },

  // Clear auth completely removes all data - use for explicit logout with API call
  clearAuth: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("🗑️ Auth data cleared from localStorage");
  },

  // Hydrate restores user data from localStorage
  hydrate: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
        console.log("✓ Auth state hydrated from localStorage");
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  },
}));
