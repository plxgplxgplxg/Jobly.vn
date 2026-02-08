import { z } from 'zod'

// Login schema
export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email hoặc số điện thoại là bắt buộc'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  taxCode: z.string().optional(),
  industry: z.string().optional(),
  role: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
}).refine((data) => {
  if (data.role === 'candidate') {
    return data.firstName && data.lastName
  }
  if (data.role === 'employer') {
    return data.companyName && data.taxCode && data.industry
  }
  return true
}, {
  message: 'Vui lòng điền đầy đủ thông tin',
  path: ['companyName']
})

export type RegisterFormData = z.infer<typeof registerSchema>

// OTP schema
export const otpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có 6 chữ số').regex(/^[0-9]+$/, 'Mã OTP chỉ chứa số')
})

export type OTPFormData = z.infer<typeof otpSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có 6 chữ số'),
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
