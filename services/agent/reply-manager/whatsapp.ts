/**
 * WhatsApp Reply Formatter
 * Formats responses for WhatsApp with appropriate formatting
 */

import type { MessageType } from "@/types";

// ============================================
// WhatsApp Formatting
// ============================================

/**
 * Format text with WhatsApp styling
 * - Bold: *text*
 * - Italic: _text_
 * - Strikethrough: ~text~
 * - Monospace: ```text```
 */
export function formatWhatsAppText(content: string): string {
  let formatted = content;

  // Convert markdown bold (**text**) to WhatsApp bold (*text*)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "*$1*");

  // Convert markdown italic (*text* with no preceding *) to WhatsApp italic (_text_)
  // This is tricky, so we skip it to avoid conflicts with bold

  // Convert markdown headers to bold text
  formatted = formatted.replace(/^#{1,6}\s*(.+)$/gm, "*$1*");

  // Convert markdown lists to simple bullets
  formatted = formatted.replace(/^[-*]\s+/gm, "• ");
  formatted = formatted.replace(/^\d+\.\s+/gm, "• ");

  // Remove excessive line breaks
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // Trim whitespace
  formatted = formatted.trim();

  return formatted;
}

// ============================================
// WhatsApp Response Formatter
// ============================================

export interface WhatsAppResponse {
  text: string;
  buttons?: WhatsAppButton[];
  list?: WhatsAppList;
}

export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface WhatsAppList {
  header: string;
  footer?: string;
  sections: WhatsAppListSection[];
}

export interface WhatsAppListSection {
  title: string;
  rows: WhatsAppListRow[];
}

export interface WhatsAppListRow {
  id: string;
  title: string;
  description?: string;
}

/**
 * Format response for WhatsApp
 */
export function formatWhatsAppResponse(
  content: string,
  type: MessageType,
  data: unknown
): WhatsAppResponse {
  const formattedContent = formatWhatsAppText(content);

  switch (type) {
    case "property-list":
      return formatPropertyListForWhatsApp(formattedContent, data as unknown[]);

    case "appointment-list":
      return formatAppointmentListForWhatsApp(formattedContent, data as unknown[]);

    case "service-list":
      return formatServiceListForWhatsApp(formattedContent, data as unknown[]);

    default:
      return { text: formattedContent };
  }
}

/**
 * Format property list for WhatsApp
 */
function formatPropertyListForWhatsApp(
  header: string,
  properties: unknown[]
): WhatsAppResponse {
  if (!properties || properties.length === 0) {
    return { text: header };
  }

  // Build text message with property details
  let text = `${header}\n\n`;

  properties.forEach((prop: unknown, index: number) => {
    const p = prop as Record<string, unknown>;
    text += `*${index + 1}. ${p.title}*\n`;
    text += `📍 ${p.location}\n`;
    text += `💰 ${p.price}\n`;
    if (p.bedrooms) text += `🛏️ ${p.bedrooms} غرف`;
    if (p.area) text += ` | 📐 ${p.area}`;
    text += "\n\n";
  });

  // Add buttons for actions
  const buttons: WhatsAppButton[] = [
    { id: "more_properties", title: "المزيد من العقارات" },
    { id: "schedule_visit", title: "حجز موعد زيارة" },
  ];

  return { text: text.trim(), buttons };
}

/**
 * Format appointment list for WhatsApp
 */
function formatAppointmentListForWhatsApp(
  header: string,
  appointments: unknown[]
): WhatsAppResponse {
  if (!appointments || appointments.length === 0) {
    return { text: header };
  }

  let text = `${header}\n\n`;

  appointments.forEach((apt: unknown) => {
    const a = apt as Record<string, unknown>;
    const statusEmoji = a.status === "confirmed" ? "✅" : a.status === "pending" ? "⏳" : "❌";
    text += `${statusEmoji} *${a.title}*\n`;
    text += `📅 ${a.date} | ⏰ ${a.time}\n`;
    if (a.description) text += `📝 ${a.description}\n`;
    text += "\n";
  });

  const buttons: WhatsAppButton[] = [
    { id: "new_appointment", title: "حجز موعد جديد" },
    { id: "cancel_appointment", title: "إلغاء موعد" },
  ];

  return { text: text.trim(), buttons };
}

/**
 * Format service list for WhatsApp
 */
function formatServiceListForWhatsApp(
  header: string,
  services: unknown[]
): WhatsAppResponse {
  if (!services || services.length === 0) {
    return { text: header };
  }

  // Use list format for services
  const sections: WhatsAppListSection[] = [];
  const servicesByCategory: Record<string, unknown[]> = {};

  // Group by category
  services.forEach((svc: unknown) => {
    const s = svc as Record<string, unknown>;
    const category = (s.category as string) || "عام";
    if (!servicesByCategory[category]) {
      servicesByCategory[category] = [];
    }
    servicesByCategory[category].push(s);
  });

  // Build sections
  Object.entries(servicesByCategory).forEach(([category, items]) => {
    sections.push({
      title: category,
      rows: items.map((item: unknown, idx: number) => {
        const s = item as Record<string, unknown>;
        return {
          id: `service_${s.id || idx}`,
          title: s.title as string,
          description: ((s.description as string) || "").substring(0, 72),
        };
      }),
    });
  });

  return {
    text: header,
    list: {
      header: "الخدمات المتاحة",
      footer: "اختر خدمة للمزيد من التفاصيل",
      sections,
    },
  };
}

/**
 * Format simple message for WhatsApp
 */
export function formatSimpleMessage(text: string): WhatsAppResponse {
  return { text: formatWhatsAppText(text) };
}

/**
 * Format error message for WhatsApp
 */
export function formatErrorMessage(error: string): WhatsAppResponse {
  return {
    text: `⚠️ *خطأ*\n\n${error}\n\nيرجى المحاولة مرة أخرى.`,
  };
}

const whatsappFormatter = {
  formatWhatsAppText,
  formatWhatsAppResponse,
  formatSimpleMessage,
  formatErrorMessage,
};

export default whatsappFormatter;

