/**
 * Appointments Tool
 * Allows the AI agent to manage user appointments
 */

import { getDataService } from "@/lib/data";
import type { Tool, ToolResult, AppointmentStatus } from "@/types";

// ============================================
// Get Appointments Tool
// ============================================

export const getAppointmentsTool: Tool = {
  name: "get_appointments",
  description: "الحصول على قائمة المواعيد المحجوزة للمستخدم",
  parameters: [
    {
      name: "userId",
      type: "string",
      description: "معرف المستخدم",
      required: true,
    },
    {
      name: "status",
      type: "string",
      description: "تصفية حسب الحالة: confirmed، pending، cancelled",
      required: false,
      enum: ["confirmed", "pending", "cancelled"],
    },
  ],
  execute: getAppointments,
};

async function getAppointments(
  params: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const dataService = getDataService();
    const userId = params.userId as string;

    if (!userId) {
      return {
        success: false,
        error: "معرف المستخدم مطلوب",
      };
    }

    let appointments = await dataService.getAppointments(userId);

    // Filter by status if provided
    const status = params.status as AppointmentStatus | undefined;
    if (status) {
      appointments = appointments.filter((a) => a.status === status);
    }

    if (appointments.length === 0) {
      return {
        success: true,
        data: {
          message: "لا توجد مواعيد محجوزة",
          appointments: [],
          count: 0,
        },
      };
    }

    // Format appointments for response
    const formattedAppointments = appointments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      date: a.date,
      time: a.time,
      status: a.status,
    }));

    return {
      success: true,
      data: {
        message: `لديك ${appointments.length} موعد`,
        appointments: formattedAppointments,
        count: appointments.length,
        responseType: "appointment-list",
      },
    };
  } catch (error) {
    console.error("Get appointments error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء جلب المواعيد",
    };
  }
}

// ============================================
// Create Appointment Tool
// ============================================

export const createAppointmentTool: Tool = {
  name: "create_appointment",
  description: "حجز موعد جديد لزيارة عقار أو استشارة",
  parameters: [
    {
      name: "userId",
      type: "string",
      description: "معرف المستخدم",
      required: true,
    },
    {
      name: "title",
      type: "string",
      description: "عنوان الموعد (مثال: زيارة عقار، استشارة استثمارية)",
      required: true,
    },
    {
      name: "description",
      type: "string",
      description: "وصف تفصيلي للموعد",
      required: false,
    },
    {
      name: "date",
      type: "string",
      description: "تاريخ الموعد بصيغة YYYY-MM-DD",
      required: true,
    },
    {
      name: "time",
      type: "string",
      description: "وقت الموعد (مثال: 10:00 ص، 03:00 م)",
      required: true,
    },
    {
      name: "propertyId",
      type: "string",
      description: "معرف العقار (إن كان الموعد لزيارة عقار)",
      required: false,
    },
  ],
  execute: createAppointment,
};

async function createAppointment(
  params: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const dataService = getDataService();

    const userId = params.userId as string;
    const title = params.title as string;
    const date = params.date as string;
    const time = params.time as string;

    if (!userId || !title || !date || !time) {
      return {
        success: false,
        error: "معرف المستخدم والعنوان والتاريخ والوقت مطلوبين",
      };
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return {
        success: false,
        error: "صيغة التاريخ غير صحيحة. استخدم YYYY-MM-DD",
      };
    }

    const appointment = await dataService.createAppointment({
      userId,
      title,
      description: params.description as string | undefined,
      date,
      time,
      status: "pending",
      propertyId: params.propertyId as string | undefined,
    });

    return {
      success: true,
      data: {
        message: "تم حجز الموعد بنجاح",
        appointment: {
          id: appointment.id,
          title: appointment.title,
          description: appointment.description,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
        },
        responseType: "appointment",
      },
    };
  } catch (error) {
    console.error("Create appointment error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء حجز الموعد",
    };
  }
}

// ============================================
// Update Appointment Tool
// ============================================

export const updateAppointmentTool: Tool = {
  name: "update_appointment",
  description: "تحديث أو إلغاء موعد",
  parameters: [
    {
      name: "appointmentId",
      type: "string",
      description: "معرف الموعد",
      required: true,
    },
    {
      name: "status",
      type: "string",
      description: "الحالة الجديدة: confirmed، pending، cancelled",
      required: false,
      enum: ["confirmed", "pending", "cancelled"],
    },
    {
      name: "date",
      type: "string",
      description: "التاريخ الجديد بصيغة YYYY-MM-DD",
      required: false,
    },
    {
      name: "time",
      type: "string",
      description: "الوقت الجديد",
      required: false,
    },
  ],
  execute: updateAppointment,
};

async function updateAppointment(
  params: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const dataService = getDataService();

    const appointmentId = params.appointmentId as string;
    if (!appointmentId) {
      return {
        success: false,
        error: "معرف الموعد مطلوب",
      };
    }

    // Check if appointment exists
    const existing = await dataService.getAppointment(appointmentId);
    if (!existing) {
      return {
        success: false,
        error: "الموعد غير موجود",
      };
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (params.status) updateData.status = params.status;
    if (params.date) updateData.date = params.date;
    if (params.time) updateData.time = params.time;

    const updated = await dataService.updateAppointment(appointmentId, updateData);

    if (!updated) {
      return {
        success: false,
        error: "فشل تحديث الموعد",
      };
    }

    const statusMessages: Record<string, string> = {
      confirmed: "تم تأكيد الموعد",
      cancelled: "تم إلغاء الموعد",
      pending: "تم تحديث الموعد",
    };

    return {
      success: true,
      data: {
        message: statusMessages[updated.status] || "تم تحديث الموعد",
        appointment: {
          id: updated.id,
          title: updated.title,
          date: updated.date,
          time: updated.time,
          status: updated.status,
        },
      },
    };
  } catch (error) {
    console.error("Update appointment error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء تحديث الموعد",
    };
  }
}

const appointmentTools = {
  getAppointmentsTool,
  createAppointmentTool,
  updateAppointmentTool,
};

export default appointmentTools;

