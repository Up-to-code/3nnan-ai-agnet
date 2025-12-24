/**
 * Reply Manager - Channel Dispatcher
 * Routes responses to appropriate formatters based on channel
 */

import type { Channel, ChatResponse, MessageType } from "@/types";
import {
  formatWebResponse,
  formatErrorResponse as formatWebError,
  formatPropertyListResponse,
  formatAppointmentListResponse,
  formatServiceListResponse,
} from "./web";
import {
  formatWhatsAppResponse,
  formatErrorMessage as formatWhatsAppError,
  WhatsAppResponse,
} from "./whatsapp";

// ============================================
// Response Types
// ============================================

export type FormattedResponse = ChatResponse | WhatsAppResponse;

export interface ReplyOptions {
  conversationId?: string;
  toolsUsed?: string[];
  modelUsed?: string;
  includeMetadata?: boolean;
}

// ============================================
// Reply Manager
// ============================================

/**
 * Format a response based on the channel
 */
export function formatResponse(
  channel: Channel,
  content: string,
  type: MessageType,
  data: unknown,
  options: ReplyOptions = {}
): FormattedResponse {
  const { toolsUsed = [], modelUsed = "unknown" } = options;

  switch (channel) {
    case "whatsapp":
      return formatWhatsAppResponse(content, type, data);

    case "web":
    default:
      const response = formatWebResponse(
        content,
        type,
        data,
        toolsUsed,
        modelUsed,
        { includeMetadata: options.includeMetadata ?? true }
      );

      // Set conversation ID if provided
      if (options.conversationId) {
        response.conversationId = options.conversationId;
      }

      return response;
  }
}

/**
 * Format an error response based on the channel
 */
export function formatError(
  channel: Channel,
  error: string,
  code?: string
): FormattedResponse {
  switch (channel) {
    case "whatsapp":
      return formatWhatsAppError(error);

    case "web":
    default:
      return formatWebError(error, code) as unknown as ChatResponse;
  }
}

/**
 * Check if channel is supported
 */
export function isValidChannel(channel: string): channel is Channel {
  return channel === "web" || channel === "whatsapp";
}

/**
 * Get default channel
 */
export function getDefaultChannel(): Channel {
  return "web";
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Format a text response
 */
export function formatTextResponse(
  channel: Channel,
  content: string,
  options: ReplyOptions = {}
): FormattedResponse {
  return formatResponse(channel, content, "text", null, options);
}

/**
 * Format property list for channel
 */
export function formatPropertiesForChannel(
  channel: Channel,
  properties: unknown[],
  message: string,
  options: ReplyOptions = {}
): FormattedResponse {
  return formatResponse(channel, message, "property-list", properties, options);
}

/**
 * Format appointments for channel
 */
export function formatAppointmentsForChannel(
  channel: Channel,
  appointments: unknown[],
  message: string,
  options: ReplyOptions = {}
): FormattedResponse {
  return formatResponse(channel, message, "appointment-list", appointments, options);
}

/**
 * Format services for channel
 */
export function formatServicesForChannel(
  channel: Channel,
  services: unknown[],
  message: string,
  options: ReplyOptions = {}
): FormattedResponse {
  return formatResponse(channel, message, "service-list", services, options);
}

// ============================================
// Exports
// ============================================

export {
  formatWebResponse,
  formatPropertyListResponse,
  formatAppointmentListResponse,
  formatServiceListResponse,
  formatWhatsAppResponse,
};

export default {
  formatResponse,
  formatError,
  formatTextResponse,
  formatPropertiesForChannel,
  formatAppointmentsForChannel,
  formatServicesForChannel,
  isValidChannel,
  getDefaultChannel,
};

