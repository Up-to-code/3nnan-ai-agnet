"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, CreditCard, LogOut, Save, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [name, setName] = useState("أحمد منصور");
    const [email, setEmail] = useState("ahmed@example.com");
    const [phone, setPhone] = useState("+966 50 123 4567");
    const [location, setLocation] = useState("الرياض، السعودية");
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general"); // general, security, history

    // Calculate completion (mock logic)
    const completion = 85;

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Implement save logic
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };

    const handleLogout = () => {
        // TODO: Implement logout logic
        router.push("/auth/login");
    };

    return (
        <div className="flex min-h-[100dvh] bg-background" dir="rtl">
            <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">الملف الشخصي</h1>
                        <p className="text-muted-foreground">إدارة معلوماتك الشخصية وإعدادات الأمان</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar / Profile Card */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                        <AvatarImage src="" alt={name} />
                                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                            {name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-background rounded-full" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{name}</h2>
                                    <p className="text-sm text-muted-foreground">عضو Pro Plan</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">اكتمال الملف</span>
                                        <span className="font-medium">{completion}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${completion}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs (Mobile: Dropdown could be better, simplified here) */}
                        <div className="flex flex-col space-y-1">
                            <Button
                                variant={activeTab === "general" ? "secondary" : "ghost"}
                                className="justify-start h-10"
                                onClick={() => setActiveTab("general")}
                            >
                                <User className="ml-2 h-4 w-4" />
                                المعلومات العامة
                            </Button>
                            <Button
                                variant={activeTab === "security" ? "secondary" : "ghost"}
                                className="justify-start h-10"
                                onClick={() => setActiveTab("security")}
                            >
                                <Lock className="ml-2 h-4 w-4" />
                                الأمان وكلمة المرور
                            </Button>
                            <Button
                                variant={activeTab === "history" ? "secondary" : "ghost"}
                                className="justify-start h-10"
                                onClick={() => setActiveTab("history")}
                            >
                                <Calendar className="ml-2 h-4 w-4" />
                                سجل النشاط
                            </Button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:border-r lg:pr-8 space-y-6">
                        {activeTab === "general" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid gap-4 p-6 rounded-2xl border border-border bg-card shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">تعديل المعلومات</h3>
                                        <Save className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-name">الاسم</Label>
                                            <Input
                                                id="profile-name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-email">البريد الإلكتروني</Label>
                                            <Input
                                                id="profile-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-phone">رقم الهاتف</Label>
                                            <Input
                                                id="profile-phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-location">الموقع</Label>
                                            <Input
                                                id="profile-location"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                                    <h3 className="text-lg font-semibold">كلمة المرور</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>كلمة المرور الحالية</Label>
                                            <Input type="password" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>كلمة المرور الجديدة</Label>
                                            <Input type="password" />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <Button variant="outline">تحديث كلمة المرور</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-lg font-semibold px-1">سجل النشاطات الأخيرة</h3>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <LogOut className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">تسجيل دخول ناجح</p>
                                                <p className="text-xs text-muted-foreground">Chrome on Windows • منذ {i} ساعات</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">التفاصيل</Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Danger Zone */}
                        <div className="pt-8">
                            <div className="p-6 rounded-2xl border border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">منطقة الخطر</h3>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="ml-2 h-4 w-4" />
                                    تسجيل الخروج
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

