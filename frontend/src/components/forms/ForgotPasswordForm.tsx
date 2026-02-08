import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../utils/validation'
import { useAuth } from '../../hooks/useAuth'

interface ForgotPasswordFormProps {
  onOTPSent?: (email: string) => void
}

export function ForgotPasswordForm({ onOTPSent }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const email = watch('email')

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true)
      await resetPassword(data.email)
      
      if (onOTPSent) {
        onOTPSent(email)
      }
    } catch (error) {
      // Error được xử lý trong useAuth hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
        </p>
        
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
      </button>

      <div className="text-center text-sm">
        <Link
          to="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  )
}
