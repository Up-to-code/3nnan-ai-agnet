"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chrome, Mail, Lock, User, Loader2, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth/client";

// ============================================
// Types
// ============================================

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ============================================
// Error Messages
// ============================================

const ERROR_MESSAGES = {
  login: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  signup: "فشل إنشاء الحساب. ربما البريد الإلكتروني مستخدم بالفعل",
  google: "حدث خطأ أثناء تسجيل الدخول عبر Google",
  network: "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً",
} as const;

// ============================================
// Benefits List
// ============================================

const BENEFITS = [
  "محادثات غير محدودة مع الذكاء الاصطناعي",
  "حفظ سجل المحادثات والعودة إليها",
  "إمكانية حجز المواعيد العقارية",
  "تخصيص تجربة البحث عن العقارات",
] as const;

// ============================================
// Auth Dialog Component
// ============================================

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Clear error when switching tabs
  const handleTabChange = () => {
    setError(null);
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email: loginEmail,
        password: loginPassword,
      });

      if (result.error) {
        setError(ERROR_MESSAGES.login);
        return;
      }

      onSuccess?.();
      onOpenChange(false);
    } catch {
      setError(ERROR_MESSAGES.network);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
      });

      if (result.error) {
        setError(ERROR_MESSAGES.signup);
        return;
      }

      onSuccess?.();
      onOpenChange(false);
    } catch {
      setError(ERROR_MESSAGES.network);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google auth
  const handleGoogleAuth = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.pathname,
      });
    } catch {
      setError(ERROR_MESSAGES.google);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="md:max-w-4xl max-w-full p-0 gap-0 overflow-hidden md:rounded-xl rounded-t-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-zinc-700" />
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Header */}
          <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 bg-gradient-to-b from-blue-500/10 to-transparent border-b border-white/5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white mb-2 text-center">
              استمر في المحادثة
            </DialogTitle>
            <DialogDescription className="text-zinc-400 flex items-center justify-center gap-2 text-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>سجل دخولك للحصول على محادثات غير محدودة</span>
            </DialogDescription>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 md:divide-x-reverse min-h-[400px]">
            {/* Forms Column */}
            <div className="p-6 md:p-8 flex flex-col">
              <Tabs defaultValue="login" className="w-full flex-1 flex flex-col" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 mb-6 p-1 h-auto rounded-lg border border-white/5">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white py-2 rounded-md transition-all"
                  >
                    تسجيل الدخول
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white py-2 rounded-md transition-all"
                  >
                    حساب جديد
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="flex-1 flex flex-col mt-0">
                  <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col">
                    <InputField
                      label="البريد الإلكتروني"
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      icon={<Mail className="w-4 h-4 text-zinc-500" />}
                      disabled={isLoading}
                    />
                    <InputField
                      label="كلمة المرور"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4 text-zinc-500" />}
                      disabled={isLoading}
                    />

                    {error && <ErrorMessage message={error} />}

                    <div className="flex-1" />

                    <SubmitButton isLoading={isLoading} text="تسجيل الدخول" />
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="flex-1 flex flex-col mt-0">
                  <form onSubmit={handleSignup} className="space-y-4 flex-1 flex flex-col">
                    <InputField
                      label="الاسم"
                      type="text"
                      placeholder="الاسم الكامل"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      icon={<User className="w-4 h-4 text-zinc-500" />}
                      disabled={isLoading}
                    />
                    <InputField
                      label="البريد الإلكتروني"
                      type="email"
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      icon={<Mail className="w-4 h-4 text-zinc-500" />}
                      disabled={isLoading}
                    />
                    <InputField
                      label="كلمة المرور"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4 text-zinc-500" />}
                      disabled={isLoading}
                    />

                    {error && <ErrorMessage message={error} />}

                    <div className="flex-1" />

                    <SubmitButton isLoading={isLoading} text="إنشاء حساب" />
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            {/* Benefits Column */}
            <div className="p-6 md:p-8 bg-zinc-900/30 flex flex-col justify-center">
              <div className="space-y-6 text-center">
                {/* Google Button */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">تسجيل سريع</h3>
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-white text-black border-0 flex items-center justify-center gap-2 font-medium transition-opacity hover:opacity-80 active:scale-[0.98]"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <Chrome className="w-5 h-5" />
                    تسجيل الدخول عبر Google
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0f0f11] px-2 text-zinc-500 font-medium">أو</span>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400">مميزات الحساب المجاني</h3>
                  <div className="grid gap-3">
                    {BENEFITS.map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-sm text-zinc-300 text-right w-full">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Helper Components
// ============================================

interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}

function InputField({ label, type, placeholder, value, onChange, icon, disabled }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-zinc-300 pr-1 block text-right">{label}</Label>
      <div className="relative">
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-zinc-900/50 border-zinc-800 text-right pr-4 text-white placeholder:text-zinc-600 h-11 focus-visible:ring-blue-600"
          dir={type === "email" || type === "password" ? "ltr" : "rtl"}
          required
          disabled={disabled}
        />
        <div className="absolute left-3 top-3.5">{icon}</div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-md border border-red-500/20">
      {message}
    </div>
  );
}

function SubmitButton({ isLoading, text }: { isLoading: boolean; text: string }) {
  return (
    <Button
      type="submit"
      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : text}
    </Button>
  );
}

export default AuthDialog;
