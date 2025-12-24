"use client";

import { cn } from "@/lib/utils";

interface MarkdownContentProps {
    content: string;
    className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
    // Simple markdown-like rendering
    const renderContent = (text: string) => {
        const lines = text.split('\n');
        const elements: JSX.Element[] = [];
        
        lines.forEach((line, index) => {
            // Headers
            if (line.startsWith('### ')) {
                elements.push(
                    <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-foreground">
                        {line.replace('### ', '')}
                    </h3>
                );
            } else if (line.startsWith('## ')) {
                elements.push(
                    <h2 key={index} className="text-xl font-bold mt-5 mb-3 text-foreground">
                        {line.replace('## ', '')}
                    </h2>
                );
            } else if (line.startsWith('# ')) {
                elements.push(
                    <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-foreground">
                        {line.replace('# ', '')}
                    </h1>
                );
            }
            // Bold text
            else if (line.includes('**')) {
                const parts = line.split('**');
                elements.push(
                    <p key={index} className="mb-2">
                        {parts.map((part, i) => 
                            i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                        )}
                    </p>
                );
            }
            // Lists
            else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                elements.push(
                    <li key={index} className="list-disc list-inside mb-1 text-foreground/90">
                        {line.replace(/^[-•]\s+/, '')}
                    </li>
                );
            }
            // Empty line
            else if (line.trim() === '') {
                elements.push(<br key={index} />);
            }
            // Regular paragraph
            else {
                elements.push(
                    <p key={index} className="mb-2 text-foreground/90 leading-relaxed">
                        {line}
                    </p>
                );
            }
        });
        
        return elements;
    };

    return (
        <div className={cn("prose prose-sm max-w-none text-right", className)}>
            <div className="space-y-1">
                {renderContent(content)}
            </div>
        </div>
    );
}

