"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  Chrome,
  ArrowRight,
} from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        onSuccess?.();
        router.push("/home");
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      // TODO: Implement OAuth login
      console.log(`Login with ${provider}`);
    } catch (err) {
      console.error(`${provider} login failed:`, err);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "32rem",
        margin: "0 auto",
        animation: "fadeIn 0.8s ease-out",
      }}
    >
      {/* Glassmorphism Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(40px)",
          borderRadius: "1.5rem",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
          padding: "2rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "3.5rem",
              height: "3.5rem",
              background: "linear-gradient(to bottom right, #3b82f6, #2563eb)",
              borderRadius: "50%",
              marginBottom: "1rem",
              boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
            }}
          >
            <Lock
              style={{ width: "1.75rem", height: "1.75rem", color: "white" }}
            />
          </div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              color: "white",
              marginBottom: "0.5rem",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "#d1d5db", fontSize: "0.875rem" }}>
            Sign in to your account to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Email Field */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#e5e7eb",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "1.25rem",
                  height: "1.25rem",
                  color: "#9ca3af",
                  transition: "color 0.2s",
                }}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                style={{
                  width: "100%",
                  paddingLeft: "2.5rem",
                  paddingRight: "1rem",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                  background: "rgba(31, 41, 55, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(59, 130, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#374151";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#e5e7eb",
                }}
              >
                Password
              </label>
              <a
                href="/forgot-password"
                style={{
                  fontSize: "0.75rem",
                  color: "#60a5fa",
                  fontWeight: "500",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
              >
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <Lock
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "1.25rem",
                  height: "1.25rem",
                  color: "#9ca3af",
                  transition: "color 0.2s",
                }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  paddingLeft: "2.5rem",
                  paddingRight: "3rem",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                  background: "rgba(31, 41, 55, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(59, 130, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#374151";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  padding: "0.5rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#d1d5db")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff style={{ width: "1.25rem", height: "1.25rem" }} />
                ) : (
                  <Eye style={{ width: "1.25rem", height: "1.25rem" }} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRememberMe(e.target.checked)
              }
              style={{
                width: "1rem",
                height: "1rem",
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "0.25rem",
                cursor: "pointer",
                accentColor: "#3b82f6",
              }}
              disabled={loading}
            />
            <label
              htmlFor="remember"
              style={{
                fontSize: "0.875rem",
                color: "#d1d5db",
                cursor: "pointer",
              }}
            >
              Remember me
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "0.5rem",
                padding: "1rem",
                display: "flex",
                gap: "0.75rem",
                animation: "shake 0.5s ease-in-out",
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <svg
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#f87171",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading
                ? "linear-gradient(to right, #4b5563, #3d4452)"
                : "linear-gradient(to right, #2563eb, #3b82f6)",
              color: "white",
              fontWeight: "600",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "1rem",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #1d4ed8, #2563eb)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #2563eb, #3b82f6)";
              }
            }}
          >
            {loading ? (
              <>
                <svg
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    animation: "spin 1s linear infinite",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity={0.25}
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    opacity={0.75}
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ position: "relative", margin: "1.5rem 0" }}>
            <div
              style={{
                position: "absolute",
                inset: "0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{ width: "100%", borderTop: "1px solid #374151" }}
              ></div>
            </div>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                fontSize: "0.75rem",
              }}
            >
              <span
                style={{
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  background:
                    "linear-gradient(to bottom, #111827, rgba(17, 24, 39, 0.8))",
                  color: "#9ca3af",
                }}
              >
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              style={{
                background: "rgba(31, 41, 55, 0.5)",
                border: "1px solid #374151",
                color: "white",
                fontWeight: "500",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                borderRadius: "0.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: loading ? 0.5 : 1,
                transition: "all 0.2s",
                fontSize: "0.875rem",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(55, 65, 81, 1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(31, 41, 55, 0.5)";
                }
              }}
            >
              <Chrome style={{ width: "1.25rem", height: "1.25rem" }} />
              <span style={{ display: "none" }}>Google</span>
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              disabled={loading}
              style={{
                background: "rgba(31, 41, 55, 0.5)",
                border: "1px solid #374151",
                color: "white",
                fontWeight: "500",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                borderRadius: "0.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: loading ? 0.5 : 1,
                transition: "all 0.2s",
                fontSize: "0.875rem",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(55, 65, 81, 1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(31, 41, 55, 0.5)";
                }
              }}
            >
              <Github style={{ width: "1.25rem", height: "1.25rem" }} />
              <span style={{ display: "none" }}>GitHub</span>
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#9ca3af",
            marginTop: "1.5rem",
          }}
        >
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              color: "#60a5fa",
              fontWeight: "600",
              textDecoration: "none",
              transition: "color 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
          >
            Sign up now
          </a>
        </p>
      </div>
    </div>
  );
}
