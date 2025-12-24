/**
 * Tool Registry
 * Central registry for all AI agent tools
 */

import type { Tool, ToolResult } from "@/types";
import { searchPropertyTool } from "./search";
import {
  getAppointmentsTool,
  createAppointmentTool,
  updateAppointmentTool,
} from "./appointments";
import { getServicesTool, getServiceCategoriesTool } from "./services";

// ============================================
// Tool Registry
// ============================================

const toolRegistry: Map<string, Tool> = new Map();

// Register all tools
toolRegistry.set(searchPropertyTool.name, searchPropertyTool);
toolRegistry.set(getAppointmentsTool.name, getAppointmentsTool);
toolRegistry.set(createAppointmentTool.name, createAppointmentTool);
toolRegistry.set(updateAppointmentTool.name, updateAppointmentTool);
toolRegistry.set(getServicesTool.name, getServicesTool);
toolRegistry.set(getServiceCategoriesTool.name, getServiceCategoriesTool);

// ============================================
// Registry Functions
// ============================================

/**
 * Get a tool by name
 */
export function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name);
}

/**
 * Get all registered tools
 */
export function getAllTools(): Tool[] {
  return Array.from(toolRegistry.values());
}

/**
 * Get tool names
 */
export function getToolNames(): string[] {
  return Array.from(toolRegistry.keys());
}

/**
 * Execute a tool by name
 */
export async function executeTool(
  name: string,
  params: Record<string, unknown>
): Promise<ToolResult> {
  const tool = toolRegistry.get(name);

  if (!tool) {
    return {
      success: false,
      error: `الأداة "${name}" غير موجودة`,
    };
  }

  try {
    const result = await tool.execute(params);
    return result as ToolResult;
  } catch (error) {
    console.error(`Error executing tool "${name}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ غير معروف",
    };
  }
}

/**
 * Get tools formatted for OpenAI function calling
 */
export function getToolsForOpenAI() {
  return getAllTools().map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object" as const,
        properties: tool.parameters.reduce(
          (acc, param) => {
            acc[param.name] = {
              type: param.type,
              description: param.description,
              ...(param.enum ? { enum: param.enum } : {}),
            };
            return acc;
          },
          {} as Record<string, unknown>
        ),
        required: tool.parameters
          .filter((p) => p.required)
          .map((p) => p.name),
      },
    },
  }));
}

/**
 * Register a new tool
 */
export function registerTool(tool: Tool): void {
  if (toolRegistry.has(tool.name)) {
    console.warn(`Tool "${tool.name}" already registered, overwriting...`);
  }
  toolRegistry.set(tool.name, tool);
}

/**
 * Unregister a tool
 */
export function unregisterTool(name: string): boolean {
  return toolRegistry.delete(name);
}

// ============================================
// Exports
// ============================================

export {
  searchPropertyTool,
  getAppointmentsTool,
  createAppointmentTool,
  updateAppointmentTool,
  getServicesTool,
  getServiceCategoriesTool,
};

const toolUtils = {
  getTool,
  getAllTools,
  getToolNames,
  executeTool,
  getToolsForOpenAI,
  registerTool,
  unregisterTool,
};

export default toolUtils;

