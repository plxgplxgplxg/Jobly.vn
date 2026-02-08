import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { loginSchema, type LoginFormData } from '../../utils/validation'
import { useAuth } from '../../hooks/useAuth'

export function LoginForm() {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      await login(data)
    } catch (error) {
      // Error được xử lý trong useAuth hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        {...register('emailOrPhone')}
        type="text"
        label="Email hoặc Số điện thoại"
        placeholder="email@example.com hoặc 0123456789"
        error={errors.emailOrPhone?.message}
        leftIcon={<span className="material-symbols-outlined">person</span>}
      />

      <Input
        {...register('password')}
        type="password"
        label="Mật khẩu"
        placeholder="••••••••"
        error={errors.password?.message}
        leftIcon={<span className="material-symbols-outlined">lock</span>}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            to="/auth/forgot-password"
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        Đăng nhập
      </Button>

      <div className="text-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">Chưa có tài khoản? </span>
        <Link
          to="/auth/register"
          className="font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>
    </form>
  )
}
