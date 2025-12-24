/**
 * Web Reply Formatter
 * Formats responses for web/API clients with full markdown support
 */

import type { ChatResponse, MessageType } from "@/types";

// ============================================
// Web Response Formatter
// ============================================

export interface WebFormatterOptions {
  includeMetadata?: boolean;
  includeTimestamp?: boolean;
}

/**
 * Format response for web clients
 */
export function formatWebResponse(
  content: string,
  type: MessageType,
  data: unknown,
  toolsUsed: string[],
  modelUsed: string,
  options: WebFormatterOptions = {}
): ChatResponse {
  const { includeMetadata = true, includeTimestamp = true } = options;

  const response: ChatResponse = {
    conversationId: "", // Will be set by API
    content: formatContent(content, type),
    type,
    timestamp: includeTimestamp ? new Date().toISOString() : "",
  };

  // Add data if present
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  // Add metadata if enabled
  if (includeMetadata) {
    response.toolsUsed = toolsUsed;
    response.modelUsed = modelUsed;
  }

  return response;
}

/**
 * Format content with markdown support
 */
function formatContent(content: string, type: MessageType): string {
  // For text responses, ensure proper markdown formatting
  if (type === "text") {
    return formatMarkdown(content);
  }

  // For structured responses, content is usually a header/intro
  return content;
}

/**
 * Format markdown content
 */
function formatMarkdown(content: string): string {
  // Ensure proper line breaks
  let formatted = content.replace(/\n{3,}/g, "\n\n");

  // Ensure lists are properly formatted
  formatted = formatted.replace(/^(\s*)[-*]\s/gm, "$1• ");

  // Ensure headers have proper spacing
  formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, "\n$1 $2\n");

  return formatted.trim();
}

// ============================================
// Response Type Handlers
// ============================================

/**
 * Format property list response
 */
export function formatPropertyListResponse(
  properties: unknown[],
  message?: string
): ChatResponse {
  return {
    conversationId: "",
    content: message || `إليك ${properties.length} عقار:`,
    type: "property-list",
    data: properties,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format appointment list response
 */
export function formatAppointmentListResponse(
  appointments: unknown[],
  message?: string
): ChatResponse {
  return {
    conversationId: "",
    content: message || `إليك ${appointments.length} موعد:`,
    type: "appointment-list",
    data: appointments,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format service list response
 */
export function formatServiceListResponse(
  services: unknown[],
  message?: string
): ChatResponse {
  return {
    conversationId: "",
    content: message || `إليك ${services.length} خدمة:`,
    type: "service-list",
    data: services,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format error response
 */
export function formatErrorResponse(
  error: string,
  code?: string
): { error: string; code?: string; timestamp: string } {
  return {
    error,
    code,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format streaming chunk
 */
export function formatStreamChunk(
  chunk: string,
  isFirst: boolean,
  isDone: boolean
): string {
  return JSON.stringify({
    type: "chunk",
    content: chunk,
    isFirst,
    isDone,
    timestamp: new Date().toISOString(),
  });
}

export default {
  formatWebResponse,
  formatPropertyListResponse,
  formatAppointmentListResponse,
  formatServiceListResponse,
  formatErrorResponse,
  formatStreamChunk,
};

