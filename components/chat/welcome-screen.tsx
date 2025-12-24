"use client";

interface WelcomeScreenProps {
    onSuggestionClick: (text: string) => void;
    userName?: string;
}

export function WelcomeScreen({ onSuggestionClick, userName = "أحمد" }: WelcomeScreenProps) {
    const questions = [
        "عرض مواعيدي القادمة",
        "عرض عقارات للبيع في الرياض",
        "عرض عقارات للإيجار",
        "ما هي الخدمات المتاحة؟",
    ];

    return (
        <div 
            className="flex h-full w-full flex-col items-center justify-center py-12 px-4"
            dir="rtl"
        >
            {/* Hero Text */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    مرحباً، {userName}
                </h1>
                <p className="text-lg text-muted-foreground">
                    كيف يمكنني مساعدتك؟
                </p>
            </div>

            {/* Question Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {questions.map((question, i) => (
                    <button
                        key={i}
                        onClick={() => onSuggestionClick(question)}
                        className="px-5 py-4 rounded-xl text-right text-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-card hover:bg-accent text-card-foreground border border-border hover:border-border/80"
                    >
                        {question}
                    </button>
                ))}
            </div>
        </div>
    );
}
