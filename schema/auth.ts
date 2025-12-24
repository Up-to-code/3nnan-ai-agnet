import { z } from "zod";

/**
 * Better-auth compatible login schema
 * Matches signIn.email({ email, password }) API
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

/**
 * Better-auth compatible signup schema
 * Matches signUp.email({ email, password, name }) API
 * Note: confirmPassword is for frontend validation only, not sent to better-auth
 */
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "الاسم مطلوب")
      .min(2, "الاسم يجب أن يكون حرفين على الأقل")
      .max(100, "الاسم طويل جداً")
      .trim(),
    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("البريد الإلكتروني غير صحيح")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, "كلمة المرور مطلوبة")
      .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      .max(100, "كلمة المرور طويلة جداً"),
    confirmPassword: z
      .string()
      .min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

/**
 * Schema for better-auth signUp.email() payload
 * Excludes confirmPassword as it's only for frontend validation
 */
export const signupPayloadSchema = signupSchema.omit({ confirmPassword: true });

/**
 * TypeScript types inferred from schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type SignupPayload = z.infer<typeof signupPayloadSchema>;

