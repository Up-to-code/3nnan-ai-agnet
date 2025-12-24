/**
 * Conversations Utility Functions
 * Helper functions for working with conversations
 * 
 * Note: For API calls, use the functions in lib/api.ts
 * This file provides utility functions for formatting and grouping
 */

export interface Conversation {
    id: string;
    title: string;
    lastMessage?: string;
    updatedAt: string;
    createdAt: string;
}

/**
 * Group conversations by date (today, yesterday, older)
 */
export function getConversationsByDate(conversations: Conversation[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const todayConvs = conversations.filter(conv => {
        const convDate = new Date(conv.updatedAt);
        return convDate >= today;
    });

    const yesterdayConvs = conversations.filter(conv => {
        const convDate = new Date(conv.updatedAt);
        return convDate >= yesterday && convDate < today;
    });

    const olderConvs = conversations.filter(conv => {
        const convDate = new Date(conv.updatedAt);
        return convDate < yesterday;
    });

    return { today: todayConvs, yesterday: yesterdayConvs, older: olderConvs };
}

/**
 * Sort conversations by updated date (most recent first)
 */
export function sortConversationsByDate(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

/**
 * Format conversation preview text
 */
export function formatPreviewText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
}

/**
 * Generate a title from the first message
 */
export function generateTitleFromMessage(message: string): string {
    // Remove extra whitespace
    const cleaned = message.replace(/\s+/g, " ").trim();
    
    // Take first 50 characters or until first period/question mark
    const endMarkers = [".","。", "?", "؟", "!", "！"];
    let endIndex = cleaned.length;
    
    for (const marker of endMarkers) {
        const idx = cleaned.indexOf(marker);
        if (idx > 0 && idx < endIndex) {
            endIndex = idx + 1;
        }
    }
    
    // Limit to 50 characters
    const title = cleaned.substring(0, Math.min(endIndex, 50));
    return title.length < cleaned.length ? title.trim() : title;
}
