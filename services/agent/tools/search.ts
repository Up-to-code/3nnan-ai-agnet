/**
 * Property Search Tool
 * Allows the AI agent to search for properties
 */

import { getDataService } from "@/lib/data";
import type { Tool, ToolResult, PropertyQuery, PropertyType } from "@/types";

// ============================================
// Search Tool Definition
// ============================================

export const searchPropertyTool: Tool = {
  name: "search_properties",
  description: "البحث عن العقارات المتاحة بناءً على معايير محددة مثل الموقع والسعر وعدد الغرف ونوع العقار (بيع أو إيجار)",
  parameters: [
    {
      name: "type",
      type: "string",
      description: "نوع العقار: 'buy' للبيع أو 'rent' للإيجار",
      required: false,
      enum: ["buy", "rent"],
    },
    {
      name: "location",
      type: "string",
      description: "الموقع أو الحي المطلوب (مثال: الملقا، العليا، النرجس)",
      required: false,
    },
    {
      name: "minPrice",
      type: "number",
      description: "الحد الأدنى للسعر",
      required: false,
    },
    {
      name: "maxPrice",
      type: "number",
      description: "الحد الأقصى للسعر",
      required: false,
    },
    {
      name: "minBedrooms",
      type: "number",
      description: "الحد الأدنى لعدد غرف النوم",
      required: false,
    },
    {
      name: "maxBedrooms",
      type: "number",
      description: "الحد الأقصى لعدد غرف النوم",
      required: false,
    },
    {
      name: "limit",
      type: "number",
      description: "عدد النتائج المطلوبة (الافتراضي 5)",
      required: false,
    },
  ],
  execute: searchProperties,
};

// ============================================
// Search Function
// ============================================

async function searchProperties(
  params: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const dataService = getDataService();

    // Build query from params
    const query: PropertyQuery = {
      type: params.type as PropertyType | undefined,
      location: params.location as string | undefined,
      minPrice: params.minPrice as number | undefined,
      maxPrice: params.maxPrice as number | undefined,
      minBedrooms: params.minBedrooms as number | undefined,
      maxBedrooms: params.maxBedrooms as number | undefined,
      limit: (params.limit as number) || 5,
    };

    // Execute search
    const properties = await dataService.searchProperties(query);

    if (properties.length === 0) {
      return {
        success: true,
        data: {
          message: "لم يتم العثور على عقارات تطابق معايير البحث",
          properties: [],
          count: 0,
        },
      };
    }

    // Format properties for response
    const formattedProperties = properties.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location,
      price: p.price,
      type: p.type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      image: p.image,
    }));

    return {
      success: true,
      data: {
        message: `تم العثور على ${properties.length} عقار`,
        properties: formattedProperties,
        count: properties.length,
        responseType: "property-list",
      },
    };
  } catch (error) {
    console.error("Search properties error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء البحث عن العقارات",
    };
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Parse price string to number
 */
export function parsePriceString(priceStr: string): number | undefined {
  // Remove currency and formatting
  const cleaned = priceStr
    .replace(/[^\d.,]/g, "")
    .replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Format number as Arabic price
 */
export function formatPrice(amount: number, type: "buy" | "rent"): string {
  const formatted = amount.toLocaleString("ar-SA");
  if (type === "rent") {
    return `${formatted} ر.س/شهر`;
  }
  return `${formatted} ر.س`;
}

export default searchPropertyTool;

