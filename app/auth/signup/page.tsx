"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Mail, Lock, User, Loader2, UserPlus, Sparkles, Check, X } from "lucide-react";
import { signUp, signIn } from "@/lib/auth/client";
import { signupSchema, signupPayloadSchema } from "@/schema";

// ============================================
// Error Messages
// ============================================

const ERROR_MESSAGES = {
  emailExists: "البريد الإلكتروني مستخدم بالفعل",
  network: "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً",
  google: "حدث خطأ أثناء التسجيل عبر Google",
  default: "حدث خطأ أثناء إنشاء الحساب",
} as const;

// ============================================
// Signup Page Component
// ============================================

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation states
  const isPasswordValid = password.length >= 6;
  const passwordsMatch = !!(password && confirmPassword && password === confirmPassword);
  const canSubmit = !!(name && email && isPasswordValid && passwordsMatch);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = signupSchema.parse({
        name,
        email,
        password,
        confirmPassword,
      });

      // Extract payload for better-auth
      const signupPayload = signupPayloadSchema.parse({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      });

      // Sign up with better-auth
      const result = await signUp.email(signupPayload);

      if (result.error) {
        setError(result.error.message || ERROR_MESSAGES.default);
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

  // Handle Google signup
  const handleGoogleSignup = async () => {
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
      setError(zodError.errors[0]?.message || ERROR_MESSAGES.default);
    } else if (err instanceof Error) {
      setError(err.message || ERROR_MESSAGES.default);
    } else {
      setError(ERROR_MESSAGES.default);
    }
  };

  // Validation indicator component
  const ValidationIndicator = ({ valid, text }: { valid: boolean; text: string }) => (
    <p className={`text-xs flex items-center gap-1 ${valid ? "text-green-500" : "text-zinc-500"}`}>
      {valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {text}
    </p>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] p-4" dir="rtl">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 bg-gradient-to-b from-blue-500/10 to-transparent border-b border-white/5">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
          <p className="text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>انضم إلينا واستمتع بجميع المميزات</span>
          </p>
        </div>

        {/* Form */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label className="text-zinc-300 pr-1 block text-right">الاسم الكامل</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="أحمد محمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-right pr-4 text-white placeholder:text-zinc-600 h-11 focus-visible:ring-blue-600"
                  required
                  disabled={isLoading}
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>
            </div>

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
              <Label className="text-zinc-300 pr-1 block text-right">كلمة المرور</Label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-right pr-4 text-white placeholder:text-zinc-600 h-11 focus-visible:ring-blue-600"
                  dir="ltr"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>
              {password && (
                <ValidationIndicator
                  valid={isPasswordValid}
                  text={isPasswordValid ? "كلمة المرور قوية" : "يجب أن تكون 6 أحرف على الأقل"}
                />
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label className="text-zinc-300 pr-1 block text-right">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-right pr-4 text-white placeholder:text-zinc-600 h-11 focus-visible:ring-blue-600"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>
              {confirmPassword && (
                <ValidationIndicator
                  valid={passwordsMatch}
                  text={passwordsMatch ? "كلمات المرور متطابقة" : "كلمات المرور غير متطابقة"}
                />
              )}
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
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء حساب"}
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

          {/* Google Signup */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-white text-black border-0 flex items-center justify-center gap-2 font-medium transition-opacity hover:opacity-80 active:scale-[0.98]"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5" />
            التسجيل عبر Google
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-zinc-400">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
