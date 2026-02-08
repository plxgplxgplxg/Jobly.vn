import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ForgotPasswordForm } from '../../components/forms/ForgotPasswordForm'
import { OTPInput } from '../../components/forms/OTPInput'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '../../services/api/auth.service'
import { useUIStore } from '../../store/uiStore'
import { useNavigate } from 'react-router-dom'

const newPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
})

type NewPasswordFormData = z.infer<typeof newPasswordSchema>

export function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addNotification } = useUIStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema)
  })

  const handleOTPSent = (email: string) => {
    setPhone(email)
    setStep('otp')
  }

  const handleOTPComplete = (otpValue: string) => {
    setOtp(otpValue)
    setStep('password')
  }

  const onSubmitNewPassword = async (data: NewPasswordFormData) => {
    try {
      setIsSubmitting(true)
      await authService.setNewPassword({
        phone,
        otp,
        newPassword: data.newPassword
      })

      addNotification({
        type: 'success',
        message: 'Đặt lại mật khẩu thành công!'
      })

      navigate('/auth/login')
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Đặt lại mật khẩu thất bại'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-3xl">work</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-primary">Jobly.vn</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {step === 'email' && 'Quên mật khẩu'}
            {step === 'otp' && 'Xác thực OTP'}
            {step === 'password' && 'Đặt mật khẩu mới'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {step === 'email' && 'Nhập email để nhận mã OTP'}
            {step === 'otp' && `Nhập mã OTP đã được gửi đến ${phone}`}
            {step === 'password' && 'Nhập mật khẩu mới của bạn'}
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-slate-900 py-8 px-4 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl sm:px-10">
          {step === 'email' && (
            <ForgotPasswordForm onOTPSent={handleOTPSent} />
          )}

          {step === 'otp' && (
            <OTPInput onComplete={handleOTPComplete} />
          )}

          {step === 'password' && (
            <form onSubmit={handleSubmit(onSubmitNewPassword)} className="space-y-6">
              <Input
                {...register('newPassword')}
                type="password"
                label="Mật khẩu mới"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                leftIcon={<span className="material-symbols-outlined">lock</span>}
              />

              <Input
                {...register('confirmPassword')}
                type="password"
                label="Xác nhận mật khẩu"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                leftIcon={<span className="material-symbols-outlined">lock</span>}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full"
              >
                Đặt lại mật khẩu
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
