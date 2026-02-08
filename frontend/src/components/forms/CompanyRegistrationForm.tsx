import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { companyService } from '../../services/api/company.service'
import { useUIStore } from '../../store/uiStore'

const companySchema = z.object({
  name: z.string().min(1, 'Tên công ty là bắt buộc'),
  website: z.string().url('Website không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  size: z.string().optional(),
  industry: z.string().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyRegistrationFormProps {
  onSuccess?: () => void
}

export function CompanyRegistrationForm({ onSuccess }: CompanyRegistrationFormProps) {
  const { addNotification } = useUIStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema)
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'error',
        message: 'Vui lòng chọn file ảnh'
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addNotification({
        type: 'error',
        message: 'Kích thước ảnh không được vượt quá 2MB'
      })
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('address', data.address)
      formData.append('description', data.description)
      if (data.website) formData.append('website', data.website)
      if (data.size) formData.append('size', data.size)
      if (data.industry) formData.append('industry', data.industry)
      if (logoFile) formData.append('logo', logoFile)

      await companyService.createCompany(formData as any)

      addNotification({
        type: 'success',
        message: 'Đăng ký công ty thành công!'
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Đăng ký công ty thất bại'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo công ty
        </label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 inline-block"
            >
              Chọn ảnh
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              PNG, JPG, GIF (max 2MB)
            </p>
          </div>
        </div>
      </div>

      {/* Company name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tên công ty <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Công ty TNHH ABC"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Website
        </label>
        <input
          {...register('website')}
          type="url"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="https://example.com"
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Địa chỉ <span className="text-red-500">*</span>
        </label>
        <input
          {...register('address')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="123 Đường ABC, Quận XYZ, Hà Nội"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      {/* Size and Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quy mô
          </label>
          <select
            {...register('size')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Chọn quy mô</option>
            <option value="1-10">1-10 nhân viên</option>
            <option value="11-50">11-50 nhân viên</option>
            <option value="51-200">51-200 nhân viên</option>
            <option value="201-500">201-500 nhân viên</option>
            <option value="500+">500+ nhân viên</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ngành nghề
          </label>
          <input
            {...register('industry')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Công nghệ thông tin"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mô tả công ty <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description')}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Giới thiệu về công ty, văn hóa làm việc, sản phẩm/dịch vụ..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng ký công ty'}
        </button>
      </div>
    </form>
  )
}
