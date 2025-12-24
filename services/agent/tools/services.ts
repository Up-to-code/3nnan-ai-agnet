/**
 * Services Tool
 * Allows the AI agent to list available services
 */

import { getDataService } from "@/lib/data";
import type { Tool, ToolResult } from "@/types";

// ============================================
// Get Services Tool
// ============================================

export const getServicesTool: Tool = {
  name: "get_services",
  description: "الحصول على قائمة الخدمات المتاحة مثل الاستشارات والتصميم والخدمات القانونية",
  parameters: [
    {
      name: "category",
      type: "string",
      description: "تصفية حسب الفئة: استثمار، تحليل، إدارة، قانوني، تصميم، تقييم، تسويق",
      required: false,
    },
  ],
  execute: getServices,
};

async function getServices(
  params: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const dataService = getDataService();
    const category = params.category as string | undefined;

    const services = await dataService.getServices(category);

    if (services.length === 0) {
      return {
        success: true,
        data: {
          message: category
            ? `لا توجد خدمات في فئة "${category}"`
            : "لا توجد خدمات متاحة حالياً",
          services: [],
          count: 0,
        },
      };
    }

    // Format services for response
    const formattedServices = services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      price: s.price,
    }));

    return {
      success: true,
      data: {
        message: `إليك ${services.length} خدمة متاحة`,
        services: formattedServices,
        count: services.length,
        responseType: "service-list",
      },
    };
  } catch (error) {
    console.error("Get services error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء جلب الخدمات",
    };
  }
}

// ============================================
// Get Service Categories Tool
// ============================================

export const getServiceCategoriesTool: Tool = {
  name: "get_service_categories",
  description: "الحصول على قائمة فئات الخدمات المتاحة",
  parameters: [],
  execute: getServiceCategories,
};

async function getServiceCategories(): Promise<ToolResult> {
  try {
    const dataService = getDataService();
    const services = await dataService.getServices();

    // Extract unique categories
    const categories = [...new Set(services.map((s) => s.category).filter(Boolean))];

    return {
      success: true,
      data: {
        message: `لدينا ${categories.length} فئة من الخدمات`,
        categories,
        count: categories.length,
      },
    };
  } catch (error) {
    console.error("Get service categories error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء جلب فئات الخدمات",
    };
  }
}

export default {
  getServicesTool,
  getServiceCategoriesTool,
};

