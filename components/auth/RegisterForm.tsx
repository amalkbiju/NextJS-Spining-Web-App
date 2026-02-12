"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Github,
  Chrome,
  ArrowRight,
} from "lucide-react";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function RegisterForm() {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score === 0) return { score: 0, label: "", color: "" };
    if (score <= 2) return { score: 1, label: "Weak", color: "#ef4444" };
    if (score <= 3) return { score: 2, label: "Fair", color: "#f59e0b" };
    if (score <= 4) return { score: 3, label: "Good", color: "#eab308" };
    return { score: 4, label: "Strong", color: "#22c55e" };
  };

  // Validation checks
  const isFullNameValid = fullName.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStrength = calculatePasswordStrength(password);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid =
    confirmPassword === password && confirmPassword.length > 0;
  const isFormValid =
    isFullNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    agreeToTerms;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please fill in all fields correctly");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        name: fullName,
        email,
        password,
      });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        router.push("/home");
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider: "google" | "github") => {
    try {
      console.log(`Sign up with ${provider}`);
      // TODO: Implement OAuth signup logic
    } catch (err) {
      console.error(`${provider} signup failed:`, err);
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
            <User
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
            Create Account
          </h1>
          <p style={{ color: "#d1d5db", fontSize: "0.875rem" }}>
            Join us today to get started
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Full Name Field */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#e5e7eb",
              }}
            >
              Full Name
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <User
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  width: "1.25rem",
                  height: "1.25rem",
                  color: "#9ca3af",
                  transition: "color 0.2s",
                }}
              />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFullName(e.target.value)
                }
                style={{
                  width: "100%",
                  paddingLeft: "2.5rem",
                  paddingRight: isFullNameValid ? "2.5rem" : "1rem",
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
                placeholder="John Doe"
                required
                disabled={loading}
              />
              {isFullNameValid && (
                <CheckCircle2
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#22c55e",
                  }}
                />
              )}
            </div>
          </div>

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
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Mail
                style={{
                  position: "absolute",
                  left: "0.75rem",
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
                  paddingRight: isEmailValid && email ? "2.5rem" : "1rem",
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
              {isEmailValid && email && (
                <CheckCircle2
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#22c55e",
                  }}
                />
              )}
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
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Lock
                style={{
                  position: "absolute",
                  left: "0.75rem",
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
                placeholder="Create a strong password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
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

            {/* Password Strength Indicator */}
            {password && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div style={{ display: "flex", gap: "0.25rem", flex: 1 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "4px",
                        background:
                          i <= passwordStrength.score
                            ? passwordStrength.color
                            : "#374151",
                        borderRadius: "2px",
                        transition: "background 0.3s",
                      }}
                    ></div>
                  ))}
                </div>
                {passwordStrength.label && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: passwordStrength.color,
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#e5e7eb",
              }}
            >
              Confirm Password
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Lock
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  width: "1.25rem",
                  height: "1.25rem",
                  color: "#9ca3af",
                  transition: "color 0.2s",
                }}
              />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  paddingLeft: "2.5rem",
                  paddingRight: isConfirmPasswordValid ? "2.5rem" : "3rem",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                  background: "rgba(31, 41, 55, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                  borderColor:
                    confirmPassword && !isConfirmPasswordValid
                      ? "#ef4444"
                      : "#374151",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(59, 130, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    confirmPassword && !isConfirmPasswordValid
                      ? "#ef4444"
                      : "#374151";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
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
                {showConfirmPassword ? (
                  <EyeOff style={{ width: "1.25rem", height: "1.25rem" }} />
                ) : (
                  <Eye style={{ width: "1.25rem", height: "1.25rem" }} />
                )}
              </button>
            </div>
            {confirmPassword && !isConfirmPasswordValid && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#ef4444",
                  fontWeight: "500",
                }}
              >
                Passwords do not match
              </p>
            )}
            {isConfirmPasswordValid && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#22c55e",
                  fontWeight: "500",
                }}
              >
                ✓ Passwords match
              </p>
            )}
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

          {/* Terms & Conditions Checkbox */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <input
              id="terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAgreeToTerms(e.target.checked)
              }
              style={{
                marginTop: "0.25rem",
                width: "1rem",
                height: "1rem",
                accentColor: "#3b82f6",
                cursor: "pointer",
              }}
              disabled={loading}
            />
            <label
              htmlFor="terms"
              style={{
                fontSize: "0.875rem",
                color: "#d1d5db",
                cursor: "pointer",
                lineHeight: "1.5",
              }}
            >
              I agree to the{" "}
              <a
                href="#"
                style={{
                  color: "#60a5fa",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                style={{
                  color: "#60a5fa",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            style={{
              width: "100%",
              background:
                loading || !isFormValid
                  ? "linear-gradient(to right, #4b5563, #3d4452)"
                  : "linear-gradient(to right, #2563eb, #3b82f6)",
              color: "white",
              fontWeight: "600",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: loading || !isFormValid ? "not-allowed" : "pointer",
              opacity: loading || !isFormValid ? 0.7 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "1rem",
              marginTop: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!loading && isFormValid) {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #1d4ed8, #2563eb)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && isFormValid) {
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ position: "relative", margin: "1rem 0" }}>
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
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Signup Buttons */}
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
              onClick={() => handleSocialSignup("google")}
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
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={() => handleSocialSignup("github")}
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
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#9ca3af",
            marginTop: "1.5rem",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
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
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
