import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { registerSchema, type RegisterFormData } from '../../utils/validation'
import { useAuth } from '../../hooks/useAuth'
import { UserRole } from '../../store/authStore'

export function RegisterForm() {
  const { register: registerUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CANDIDATE)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.CANDIDATE
    }
  })

  useEffect(() => {
    setValue('role', selectedRole)
  }, [selectedRole, setValue])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true)
      await registerUser(data)
    } catch (error) {
      // Error được xử lý trong useAuth hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
          Loại tài khoản
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSelectedRole(UserRole.CANDIDATE)}
            className={`p-4 border-2 rounded-xl text-center transition-all ${selectedRole === UserRole.CANDIDATE
              ? 'border-primary bg-primary/10'
              : 'border-slate-300 dark:border-slate-700 hover:border-primary/50'
              }`}
          >
            <div className="font-bold text-slate-900 dark:text-slate-100">Ứng viên</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Tìm việc làm</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole(UserRole.EMPLOYER)}
            className={`p-4 border-2 rounded-xl text-center transition-all ${selectedRole === UserRole.EMPLOYER
              ? 'border-primary bg-primary/10'
              : 'border-slate-300 dark:border-slate-700 hover:border-primary/50'
              }`}
          >
            <div className="font-bold text-slate-900 dark:text-slate-100">Nhà tuyển dụng</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Đăng tin tuyển dụng</div>
          </button>
        </div>
        <input type="hidden" {...register('role')} value={selectedRole} />
      </div>

      {selectedRole === UserRole.CANDIDATE ? (
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('firstName')}
            type="text"
            label="Họ"
            error={errors.firstName?.message}
          />

          <Input
            {...register('lastName')}
            type="text"
            label="Tên"
            error={errors.lastName?.message}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            {...register('companyName')}
            type="text"
            label="Tên công ty"
            placeholder="VD: Công ty TNHH ABC"
            error={errors.companyName?.message}
          />

          <Input
            {...register('taxCode')}
            type="text"
            label="Mã số thuế"
            placeholder="10 hoặc 13 số"
            error={errors.taxCode?.message}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ngành nghề
            </label>
            <select
              {...register('industry')}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white"
            >
              <option value="">Chọn ngành nghề</option>
              <option value="Công nghệ thông tin">Công nghệ thông tin</option>
              <option value="Thương mại điện tử">Thương mại điện tử</option>
              <option value="Viễn thông">Viễn thông</option>
              <option value="Tài chính - Ngân hàng">Tài chính - Ngân hàng</option>
              <option value="Marketing">Marketing</option>
              <option value="Giáo dục">Giáo dục</option>
              <option value="Y tế">Y tế</option>
              <option value="Xây dựng">Xây dựng</option>
              <option value="Sản xuất">Sản xuất</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>
        </div>
      )}

      <Input
        {...register('email')}
        type="email"
        label="Email"
        placeholder="email@example.com"
        error={errors.email?.message}
        leftIcon={<span className="material-symbols-outlined">mail</span>}
      />

      <Input
        {...register('phone')}
        type="tel"
        label="Số điện thoại"
        placeholder="0123456789"
        error={errors.phone?.message}
        leftIcon={<span className="material-symbols-outlined">phone</span>}
      />

      <Input
        {...register('password')}
        type="password"
        label="Mật khẩu"
        placeholder="••••••••"
        error={errors.password?.message}
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
        Đăng ký
      </Button>

      <div className="text-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">Đã có tài khoản? </span>
        <Link
          to="/auth/login"
          className="font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    </form>
  )
}
