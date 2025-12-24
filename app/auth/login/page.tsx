"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Mail, Lock, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { signIn } from "@/lib/auth/client";
import { loginSchema } from "@/schema";

// ============================================
// Error Messages
// ============================================

const ERROR_MESSAGES = {
  validation: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  network: "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً",
  google: "حدث خطأ أثناء تسجيل الدخول عبر Google",
  default: "حدث خطأ أثناء تسجيل الدخول",
} as const;

// ============================================
// Login Page Component
// ============================================

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = loginSchema.parse({ email, password });

      // Sign in with better-auth
      const result = await signIn.email({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (result.error) {
        setError(result.error.message || ERROR_MESSAGES.validation);
        return;
      }

      // Success - redirect to chat
      router.push("/chat/new");
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/chat/new",
      });
    } catch {
      setError(ERROR_MESSAGES.google);
    }
  };

  // Handle errors
  const handleError = (err: unknown) => {
    if (err && typeof err === "object" && "errors" in err) {
      const zodError = err as { errors: Array<{ message: string }> };
      setError(zodError.errors[0]?.message || ERROR_MESSAGES.validation);
    } else if (err instanceof Error) {
      setError(err.message || ERROR_MESSAGES.default);
    } else {
      setError(ERROR_MESSAGES.default);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] p-4" dir="rtl">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 bg-gradient-to-b from-blue-500/10 to-transparent border-b border-white/5">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h1>
          <p className="text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>مرحباً بعودتك! الرجاء إدخال بياناتك</span>
          </p>
        </div>

        {/* Form */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-zinc-300 pr-1 block text-right">البريد الإلكتروني</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-right pr-4 text-white placeholder:text-zinc-600 h-11 focus-visible:ring-blue-600"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300 pr-1 block text-right">كلمة المرور</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-blue-500 hover:text-blue-400 hover:underline transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-right pr-4 text-white placeholder:text-zinc-600 h-11 focus-visible:ring-blue-600"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-md border border-red-500/20">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تسجيل الدخول"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0a] px-2 text-zinc-500 font-medium">أو</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-white text-black border-0 flex items-center justify-center gap-2 font-medium transition-opacity hover:opacity-80 active:scale-[0.98]"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5" />
            تسجيل الدخول عبر Google
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-zinc-400">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-blue-500 hover:text-blue-400 font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
