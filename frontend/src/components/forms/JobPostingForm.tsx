import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { jobService } from '../../services/api/job.service'
import { JobType } from '../../types/job.types'
import { useUIStore } from '../../store/uiStore'

const jobSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().min(50, 'Mô tả phải có ít nhất 50 ký tự'),
  requirements: z.string().min(20, 'Yêu cầu phải có ít nhất 20 ký tự'),
  benefits: z.string().optional(),
  salaryMin: z.number().min(0, 'Lương tối thiểu phải >= 0'),
  salaryMax: z.number().min(0, 'Lương tối đa phải >= 0'),
  location: z.string().min(1, 'Địa điểm là bắt buộc'),
  type: z.enum([JobType.FULL_TIME, JobType.PART_TIME, JobType.CONTRACT, JobType.INTERNSHIP]),
  expiresAt: z.string().min(1, 'Hạn nộp hồ sơ là bắt buộc'),
}).refine(data => data.salaryMax >= data.salaryMin, {
  message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
  path: ['salaryMax']
})

type JobFormData = z.infer<typeof jobSchema>

interface JobPostingFormProps {
  initialData?: Partial<JobFormData>
  jobId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const JOB_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: 'Toàn thời gian' },
  { value: JobType.PART_TIME, label: 'Bán thời gian' },
  { value: JobType.CONTRACT, label: 'Hợp đồng' },
  { value: JobType.INTERNSHIP, label: 'Thực tập' },
]

export function JobPostingForm({ initialData, jobId, onSuccess, onCancel }: JobPostingFormProps) {
  const { addNotification } = useUIStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: initialData || {
      salaryMin: 0,
      salaryMax: 0,
      type: JobType.FULL_TIME,
    }
  })

  const salaryMin = watch('salaryMin')
  const salaryMax = watch('salaryMax')

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true)

      const jobData = {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits,
        salary: {
          min: data.salaryMin,
          max: data.salaryMax,
          currency: 'VND'
        },
        location: data.location,
        type: data.type,
        expiresAt: data.expiresAt,
      }

      if (jobId) {
        await jobService.updateJob(jobId, jobData as any)
        addNotification({
          type: 'success',
          message: 'Cập nhật tin tuyển dụng thành công!'
        })
      } else {
        await jobService.createJob(jobData as any)
        addNotification({
          type: 'success',
          message: 'Đăng tin tuyển dụng thành công! Tin của bạn đang chờ duyệt.'
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể đăng tin tuyển dụng'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatSalary = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} triệu`
    }
    return `${(value / 1000).toFixed(0)}K`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tiêu đề công việc <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="VD: Senior Frontend Developer"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Location and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Địa điểm <span className="text-red-500">*</span>
          </label>
          <input
            {...register('location')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Hà Nội, TP.HCM..."
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Loại hình công việc <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {JOB_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mức lương (VNĐ) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              {...register('salaryMin', { valueAsNumber: true })}
              type="number"
              step="1000000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Từ"
            />
            {salaryMin > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatSalary(salaryMin)}
              </p>
            )}
          </div>
          <div>
            <input
              {...register('salaryMax', { valueAsNumber: true })}
              type="number"
              step="1000000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Đến"
            />
            {salaryMax > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatSalary(salaryMax)}
              </p>
            )}
          </div>
        </div>
        {(errors.salaryMin || errors.salaryMax) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.salaryMin?.message || errors.salaryMax?.message}
          </p>
        )}
      </div>

      {/* Expires At */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hạn nộp hồ sơ <span className="text-red-500">*</span>
        </label>
        <input
          {...register('expiresAt')}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        {errors.expiresAt && (
          <p className="mt-1 text-sm text-red-600">{errors.expiresAt.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mô tả công việc <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description')}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Mô tả chi tiết về công việc, trách nhiệm, môi trường làm việc..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Yêu cầu công việc <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('requirements')}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Kinh nghiệm, kỹ năng, bằng cấp yêu cầu..."
        />
        {errors.requirements && (
          <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
        )}
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Quyền lợi
        </label>
        <textarea
          {...register('benefits')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Lương thưởng, bảo hiểm, đào tạo, các phúc lợi khác..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Đang xử lý...' : jobId ? 'Cập nhật' : 'Đăng tin'}
        </button>
      </div>
    </form>
  )
}
