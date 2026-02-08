import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import type { UpdateProfileData } from '../../services/api/user.service'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Họ là bắt buộc'),
  lastName: z.string().min(1, 'Tên là bắt buộc'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  summary: z.string().optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>
  onSubmit: (data: UpdateProfileData) => Promise<void>
}

export function ProfileForm({ initialData, onSubmit }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Họ <span className="text-red-500">*</span>
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tên <span className="text-red-500">*</span>
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="0123456789"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Địa chỉ
        </label>
        <input
          {...register('address')}
          type="text"
          id="address"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ngày sinh
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            id="dateOfBirth"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Giới tính
          </label>
          <select
            {...register('gender')}
            id="gender"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Giới thiệu bản thân
        </label>
        <textarea
          {...register('summary')}
          id="summary"
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Viết vài dòng về bản thân..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
        </button>
      </div>
    </form>
  )
}
