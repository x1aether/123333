"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
// TODO(AUTH_REENABLE): Re-import `signIn` from "next-auth/react" once Google
// OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are configured.
// import { signIn } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // TODO(AUTH_REENABLE): Restore the verification-code state when SMTP is
  // configured (GMAIL_USER, GMAIL_APP_PASSWORD). The state variables and
  // handlers below are preserved verbatim for one-line re-enablement.
  // const [step, setStep] = useState<1 | 2 | 3>(1);
  // const [code, setCode] = useState("");
  // const [devCode, setDevCode] = useState("");
  // const [codeSending, setCodeSending] = useState(false);
  // const [verifying, setVerifying] = useState(false);

  const redirectTo =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect") || undefined
      : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Direct registration — no email verification step (temporarily).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    if (formData.password.length < 8) {
      setError(t("register.passwordMin"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Log the user in immediately and send them to their intended page.
        const result = await login(
          { email: formData.email, password: formData.password },
          redirectTo
        );
        if (!result.success) {
          // Account was created but session cookie failed to set; fall back.
          const dest = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/account";
          router.push(dest);
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError(t("auth.networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  // TODO(AUTH_REENABLE): Restore handleStep1Next (send verification code)
  // and handleStep2Verify (verify code + create user) once SMTP is configured.
  // Both handlers are preserved in git history / previous revision.

  // TODO(AUTH_REENABLE): Restore handleResendCode for the verification step.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-luxury-black px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-luxury-black dark:bg-luxury-gold rounded-full flex items-center justify-center">
              <span className="text-luxury-white dark:text-luxury-black text-sm font-bold">EC</span>
            </div>
            <span className="font-display text-2xl tracking-wide">Eye Care</span>
          </Link>
          <h1 className="font-display text-3xl mt-6 mb-2">{t("register.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t("register.subtitle")}</p>
        </div>

        {/* ----------------------------------------------------------------
         * TODO(AUTH_REENABLE): Restore the 3-step progress indicator once
         * email verification is re-enabled. The JSX is preserved verbatim.
         * ----------------------------------------------------------------
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s <= step ? "bg-luxury-black dark:bg-luxury-white text-white dark:text-luxury-black" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-luxury-black dark:bg-luxury-white" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </div>
          ))}
        </div>
        */}

        {/* Card */}
        <div className="bg-white dark:bg-luxury-gray shadow-luxury rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded">
              {error}
            </div>
          )}

          {/* Single-step registration form (temporarily). */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("register.name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
            <Input
              label={t("register.email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("login.emailPlaceholder")}
              required
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label={t("register.password")}
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("register.passwordMin")}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${dir === "rtl" ? "left-3" : "right-3"}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label={t("auth.confirmPassword")}
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t("register.passwordMin")}
              required
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full mt-2" size="lg" disabled={submitting}>
              {submitting ? t("login.signingIn") : t("register.signUp")}
            </Button>
          </form>

          {/* ----------------------------------------------------------------
           * TODO(AUTH_REENABLE): Restore the email-verification step (Step 2)
           * once SMTP is configured (GMAIL_USER, GMAIL_APP_PASSWORD). The JSX
           * below is preserved verbatim for one-line re-enablement.
           * ----------------------------------------------------------------
          {step === 2 && (
            <form onSubmit={handleStep2Verify} className="space-y-4">
              <p className="text-center text-gray-500 mb-4">
                {t("auth.codeSent")} <strong className="text-gray-900 dark:text-white">{formData.email}</strong>
              </p>
              {devCode && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-center">
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">{t("auth.devCodeNotice")}</p>
                  <p className="text-2xl font-mono font-bold tracking-widest text-amber-900 dark:text-amber-300">{devCode}</p>
                </div>
              )}
              <Input
                label={t("auth.verificationCode")}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <Button type="submit" className="w-full" size="lg" disabled={verifying}>
                {verifying ? t("auth.verifying") : t("auth.verify")}
              </Button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={codeSending}
                className="w-full text-center text-sm text-luxury-gold hover:underline disabled:opacity-50"
              >
                {codeSending ? t("auth.sendingCode") : t("auth.resendCode")}
              </button>
            </form>
          )}
          */}

          {/* ----------------------------------------------------------------
           * TODO(AUTH_REENABLE): Restore the "Account created" step (Step 3)
           * once email verification is re-enabled.
           * ----------------------------------------------------------------
          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("register.title")}</h2>
              <p className="text-gray-500">{t("auth.accountCreated")}</p>
            </div>
          )}
          */}

          {/* ----------------------------------------------------------------
           * TODO(AUTH_REENABLE): Re-enable the Google Login button once
           * GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured.
           * The JSX is preserved verbatim for one-line re-enablement.
           * ----------------------------------------------------------------
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-luxury-gray text-gray-400">{t("auth.orDivider")}</span></div>
          </div>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: redirectTo || "/account" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t("auth.googleLogin")}
          </button>
          */}
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          {t("register.hasAccount")}{" "}
          <Link href="/login" className="text-luxury-gold hover:underline font-medium">
            {t("register.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
