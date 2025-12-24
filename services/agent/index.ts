/**
 * AI Agent Core
 * Main orchestration layer for AI interactions
 * Uses OpenAI SDK directly for OpenRouter compatibility
 */

import OpenAI from "openai";
import { getDataService } from "@/lib/data";
import {
  getModelForPlan,
  validateApiKey,
  getMaxContextMessages,
  getModelTimeout,
} from "@/lib/utils/models";
import { executeTool } from "./tools";
import type { UserPlan, ToolResult } from "@/types";

// ============================================
// System Prompt
// ============================================

const SYSTEM_PROMPT = `أنت عنان، مساعد ذكي متخصص في العقارات في المملكة العربية السعودية.

مهامك الرئيسية:
1. مساعدة المستخدمين في البحث عن العقارات (فلل، شقق، أراضي) للبيع أو الإيجار
2. تقديم معلومات عن الأسعار والمواقع والمميزات
3. حجز مواعيد لزيارة العقارات
4. تقديم استشارات عقارية واستثمارية
5. عرض الخدمات المتاحة مثل التصميم الداخلي والخدمات القانونية

قواعد مهمة:
- تحدث دائماً باللغة العربية بأسلوب مهني وودود
- استخدم الأدوات المتاحة لك للبحث عن العقارات وحجز المواعيد
- قدم معلومات دقيقة ومفيدة
- اسأل أسئلة توضيحية إذا لم تكن متأكداً من طلب المستخدم
- كن مختصراً ومباشراً في إجاباتك
- استخدم الأرقام العربية عند الإمكان
- كن إيجابياً ومشجعاً في تعاملك مع العملاء

عند عرض العقارات:
- اذكر الموقع والسعر وعدد الغرف والمساحة
- اذكر المميزات الرئيسية
- اقترح حجز موعد للمعاينة إذا كان العميل مهتماً

عند عرض المواعيد:
- اذكر التاريخ والوقت والحالة
- تأكد من أن المواعيد مرتبة حسب التاريخ

عند عرض الخدمات:
- اذكر اسم الخدمة والفئة والوصف
- اشرح كيف يمكن للعميل الاستفادة منها

عند حجز موعد جديد:
- استخدم أداة create_appointment دائماً عندما يطلب المستخدم حجز موعد
- استخرج التاريخ والوقت من رسالة المستخدم (مثال: "السبت الساعة 10 صباحاً" = Saturday, 10:00)
- إذا لم يحدد المستخدم تاريخاً محدداً، استخدم أقرب يوم سبت متاح
- حول الأيام العربية إلى تواريخ بصيغة YYYY-MM-DD
- حول الأوقات إلى صيغة 24 ساعة (مثال: 10 صباحاً = 10:00، 3 مساءً = 15:00)
- أكد الحجز للمستخدم بعد إنشائه بنجاح
- لا تعرض المواعيد الموجودة فقط، أنشئ موعد جديد إذا طلب المستخدم ذلك

عند استخدام الأدوات، ستظهر النتائج بتنسيق مناسب تلقائياً.`;

// ============================================
// Agent Configuration
// ============================================

interface AgentConfig {
  userId: string;
  userPlan: UserPlan;
  conversationId?: string;
  preferredModel?: string;
}

interface AgentResponse {
  content: string;
  type: "text" | "property-list" | "appointment-list" | "service-list";
  data?: unknown;
  toolsUsed: string[];
  modelUsed: string;
  tokensUsed?: number;
}

// ============================================
// Message Type for Context
// ============================================

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ============================================
// Create OpenRouter Client (using OpenAI SDK)
// ============================================

function createOpenRouterClient() {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Anan AI - Real Estate Assistant",
    },
  });
}

// ============================================
// Tool Definitions for OpenAI format
// ============================================

const toolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_properties",
      description: "البحث عن العقارات المتاحة بناءً على معايير محددة مثل الموقع والسعر وعدد الغرف ونوع العقار",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["buy", "rent"],
            description: "نوع العقار: 'buy' للبيع أو 'rent' للإيجار",
          },
          location: {
            type: "string",
            description: "الموقع أو الحي المطلوب",
          },
          minPrice: {
            type: "number",
            description: "الحد الأدنى للسعر",
          },
          maxPrice: {
            type: "number",
            description: "الحد الأقصى للسعر",
          },
          minBedrooms: {
            type: "number",
            description: "الحد الأدنى لعدد غرف النوم",
          },
          limit: {
            type: "number",
            description: "عدد النتائج المطلوبة",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_appointments",
      description: "عرض المواعيد الموجودة فقط. استخدم هذه الأداة عندما يطلب المستخدم رؤية مواعيده الحالية. لا تستخدمها لإنشاء موعد جديد - استخدم create_appointment بدلاً من ذلك.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["confirmed", "pending", "cancelled"],
            description: "تصفية حسب الحالة",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment",
      description: "حجز موعد جديد لزيارة عقار أو استشارة. استخدم هذه الأداة عندما يطلب المستخدم حجز موعد جديد أو إنشاء موعد. استخرج التاريخ والوقت من رسالة المستخدم وحولها إلى الصيغة المطلوبة.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "عنوان الموعد (مثال: زيارة فيلا في حي العليا، استشارة استثمارية)",
          },
          description: {
            type: "string",
            description: "وصف تفصيلي للموعد (اختياري)",
          },
          date: {
            type: "string",
            description: "تاريخ الموعد بصيغة YYYY-MM-DD. حول الأيام العربية إلى تواريخ (مثال: السبت = Saturday date)",
          },
          time: {
            type: "string",
            description: "وقت الموعد بصيغة 24 ساعة (مثال: 10:00 للعاشرة صباحاً، 15:00 للثالثة مساءً)",
          },
          propertyId: {
            type: "string",
            description: "معرف العقار إذا كان الموعد لزيارة عقار محدد (اختياري)",
          },
        },
        required: ["title", "date", "time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_services",
      description: "الحصول على قائمة الخدمات المتاحة",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "تصفية حسب الفئة",
          },
        },
      },
    },
  },
];

// ============================================
// Build Context Messages
// ============================================

async function buildContextMessages(
  conversationId: string | undefined,
  userMessage: string,
  modelId: string
): Promise<ChatMessage[]> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  // Load conversation history if available
  if (conversationId) {
    try {
      const dataService = getDataService();
      const maxMessages = getMaxContextMessages(modelId);
      const history = await dataService.getContextMessages(conversationId, maxMessages);

      for (const msg of history) {
        messages.push({
          role: msg.isAi ? "assistant" : "user",
          content: msg.content,
        });
      }
    } catch (error) {
      console.warn("Failed to load conversation history:", error);
    }
  }

  // Add current user message
  messages.push({ role: "user", content: userMessage });

  return messages;
}

// ============================================
// Process Tool Results
// ============================================

function processToolResults(
  toolResults: ToolResult[]
): { responseData: unknown; responseType: string } {
  let responseData: unknown = null;
  let responseType = "text";

  for (const result of toolResults) {
    if (result.success && result.data) {
      const data = result.data as Record<string, unknown>;
      if (data.responseType) {
        responseType = data.responseType as string;
      }
      if (data.properties) {
        responseData = data.properties;
      } else if (data.appointments) {
        responseData = data.appointments;
      } else if (data.services) {
        responseData = data.services;
      } else if (data.appointment) {
        responseData = data.appointment;
      }
    }
  }

  return { responseData, responseType };
}

// ============================================
// Main Agent Function
// ============================================

export async function invokeAgent(
  message: string,
  config: AgentConfig
): Promise<AgentResponse> {
  // Validate API key
  if (!validateApiKey()) {
    console.error("❌ OPENROUTER_API_KEY is not configured. Please add it to .env file.");
    return {
      content: "عذراً، مفتاح API غير مُعدّ. يرجى إضافة OPENROUTER_API_KEY في ملف .env",
      type: "text",
      toolsUsed: [],
      modelUsed: "none",
      tokensUsed: 0,
    };
  }

  // Get appropriate model
  const modelId = getModelForPlan(config.userPlan, config.preferredModel);
  const timeout = getModelTimeout(modelId);

  try {
    // Create OpenRouter client
    const openrouter = createOpenRouterClient();

    // Build context messages
    const messages = await buildContextMessages(
      config.conversationId,
      message,
      modelId
    );

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Generate response with tool calling
      const response = await openrouter.chat.completions.create(
        {
          model: modelId,
          messages,
          tools: toolDefinitions,
          tool_choice: "auto",
          max_tokens: 1000,
          temperature: 0.7,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const choice = response.choices[0];
      const responseMessage = choice.message;
      
      // Extract token usage from response (handle different response structures)
      let tokensUsed = 0;
      if (response.usage?.total_tokens) {
        tokensUsed = response.usage.total_tokens;
      } else if (response.usage?.prompt_tokens || response.usage?.completion_tokens) {
        // Calculate total if we have prompt and completion tokens separately
        tokensUsed = (response.usage.prompt_tokens || 0) + (response.usage.completion_tokens || 0);
      }
      
      // Enhanced logging - show full usage object, especially when tokens are 0
      if (tokensUsed === 0) {
        console.warn(`[Agent] No tokens extracted from OpenRouter response (user: ${config.userId})`);
        console.warn(`[Agent] Full response.usage object:`, JSON.stringify(response.usage, null, 2));
        console.warn(`[Agent] Response structure:`, {
          hasUsage: !!response.usage,
          usageKeys: response.usage ? Object.keys(response.usage) : [],
          usageType: typeof response.usage,
        });
      } else {
        console.log(`[Agent] Extracted ${tokensUsed} tokens from OpenRouter response (user: ${config.userId})`, {
          total: response.usage?.total_tokens,
          prompt: response.usage?.prompt_tokens,
          completion: response.usage?.completion_tokens,
          fullUsage: response.usage,
        });
      }

      // Process tool calls if any
      const toolsUsed: string[] = [];
      const toolResults: ToolResult[] = [];
      let responseData: unknown = null;
      let responseType: "text" | "property-list" | "appointment-list" | "service-list" = "text";

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          // OpenAI SDK tool calls have a function property
          const toolCallAny = toolCall as { function?: { name: string; arguments?: string } };
          
          if (!toolCallAny.function) {
            console.warn("Tool call missing function property:", toolCall);
            continue;
          }

          const toolName = toolCallAny.function.name;
          toolsUsed.push(toolName);

          try {
            const args = JSON.parse(toolCallAny.function.arguments || "{}");
            const result = await executeTool(toolName, { ...args, userId: config.userId });
            toolResults.push(result);
          } catch (error) {
            console.error(`Tool ${toolName} execution failed:`, error);
            toolResults.push({
              success: false,
              error: `فشل تنفيذ الأداة: ${error instanceof Error ? error.message : String(error)}`,
            });
          }
        }

        if (toolResults.length > 0) {
          const { responseData: data, responseType: type } = processToolResults(toolResults);
          responseData = data;
          responseType = type as typeof responseType;

          // Generate summary from tool results
          const successfulResults = toolResults.filter((r) => r.success);
          if (successfulResults.length > 0) {
            const firstResult = successfulResults[0].data as Record<string, unknown>;
            const summaryMessage = (firstResult?.message as string) || "إليك النتائج:";

            // If no text response, use the tool result message
            if (!responseMessage.content || responseMessage.content.trim().length === 0) {
              return {
                content: summaryMessage,
                type: responseType,
                data: responseData,
                toolsUsed,
                modelUsed: modelId,
                tokensUsed,
              };
            }
          }
        }
      }

      return {
        content: responseMessage.content || "عذراً، لم أتمكن من معالجة طلبك.",
        type: responseType,
        data: responseData,
        toolsUsed,
        modelUsed: modelId,
        tokensUsed,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Agent error:", error);

    // Try fallback to free model if paid model fails
    if (config.userPlan === "paid") {
      console.log("Attempting fallback to free model...");
      return invokeAgent(message, {
        ...config,
        userPlan: "free",
      });
    }

    return {
      content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
      type: "text",
      toolsUsed: [],
      modelUsed: "error",
      tokensUsed: 0,
    };
  }
}

// ============================================
// Streaming Agent (for real-time responses)
// ============================================

export async function* streamAgent(
  message: string,
  config: AgentConfig
): AsyncGenerator<string, AgentResponse, unknown> {
  if (!validateApiKey()) {
    yield "عذراً، هناك مشكلة في إعداد الخدمة.";
    return {
      content: "عذراً، هناك مشكلة في إعداد الخدمة.",
      type: "text",
      toolsUsed: [],
      modelUsed: "none",
      tokensUsed: 0,
    };
  }

  const modelId = getModelForPlan(config.userPlan, config.preferredModel);
  const timeout = getModelTimeout(modelId);

  try {
    const openrouter = createOpenRouterClient();
    const messages = await buildContextMessages(
      config.conversationId,
      message,
      modelId
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const stream = await openrouter.chat.completions.create(
        {
          model: modelId,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        },
        { signal: controller.signal }
      );

      let fullContent = "";
      let tokensUsed = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          yield delta;
        }
        // Track token usage from stream (OpenRouter sends usage in final chunk)
        if (chunk.usage?.total_tokens) {
          tokensUsed = chunk.usage.total_tokens;
          console.log(`[Agent Stream] Updated token count: ${tokensUsed} tokens (user: ${config.userId})`, {
            chunkUsage: chunk.usage,
          });
        } else if (chunk.usage?.prompt_tokens || chunk.usage?.completion_tokens) {
          // Calculate total if we have prompt and completion tokens separately
          const promptTokens = chunk.usage.prompt_tokens || 0;
          const completionTokens = chunk.usage.completion_tokens || 0;
          tokensUsed = promptTokens + completionTokens;
          console.log(`[Agent Stream] Calculated token count from components: ${tokensUsed} tokens (user: ${config.userId})`, {
            promptTokens,
            completionTokens,
            chunkUsage: chunk.usage,
          });
        }
      }
      
      // Log final token count with enhanced logging
      if (tokensUsed > 0) {
        console.log(`[Agent Stream] Final token count: ${tokensUsed} tokens (user: ${config.userId})`);
      } else {
        console.warn(`[Agent Stream] No token usage detected in stream (user: ${config.userId})`);
        console.warn(`[Agent Stream] Checked all chunks but found no usage data. This may indicate an issue with OpenRouter streaming response format.`);
      }

      clearTimeout(timeoutId);

      return {
        content: fullContent,
        type: "text",
        toolsUsed: [],
        modelUsed: modelId,
        tokensUsed,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Stream agent error:", error);
    yield "عذراً، حدث خطأ.";
    return {
      content: "عذراً، حدث خطأ.",
      type: "text",
      toolsUsed: [],
      modelUsed: "error",
      tokensUsed: 0,
    };
  }
}

// ============================================
// Exports
// ============================================

export type { AgentConfig, AgentResponse };
export { SYSTEM_PROMPT };
