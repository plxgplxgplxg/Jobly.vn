import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { jobService } from '../../services/api/job.service'
import { userService, type CV } from '../../services/api/user.service'
import { applicationService } from '../../services/api/application.service'
import type { Job } from '../../types/job.types'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  contract: 'Hợp đồng',
  internship: 'Thực tập',
}

interface ApplicationForm {
  cvId: string;
  coverLetter: string;
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addNotification } = useUIStore()
  const { isAuthenticated } = useAuthStore()

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [cvList, setCvList] = useState<CV[]>([])
  const [isLoadingCVs, setIsLoadingCVs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationForm>()

  useEffect(() => {
    if (id) {
      loadJob(id)
    }
  }, [id])

  useEffect(() => {
    if (showApplicationModal && isAuthenticated) {
      loadCVs()
    }
  }, [showApplicationModal, isAuthenticated])

  const loadJob = async (jobId: string) => {
    try {
      setIsLoading(true)
      const data = await jobService.getJobById(jobId)
      setJob(data as unknown as Job)
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải thông tin công việc'
      })
      navigate('/jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCVs = async () => {
    try {
      setIsLoadingCVs(true)
      const data = await userService.getMyCVs()
      setCvList(data)
    } catch (error) {
      console.error('Failed to load CVs', error)
      addNotification({
        type: 'error',
        message: 'Không thể tải danh sách CV của bạn'
      })
    } finally {
      setIsLoadingCVs(false)
    }
  }

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'info',
        message: 'Vui lòng đăng nhập để ứng tuyển'
      })
      navigate('/auth/login', { state: { returnUrl: `/jobs/${id}` } })
      return
    }
    setShowApplicationModal(true)
  }

  const onSubmitApplication = async (data: ApplicationForm) => {
    if (!job) return

    try {
      setIsSubmitting(true)
      await applicationService.applyJob({
        jobId: job.id,
        cvId: data.cvId,
        cvType: 'uploaded', // Mặc định là uploaded CV
        coverLetter: data.coverLetter
      })

      addNotification({
        type: 'success',
        message: 'Ứng tuyển thành công!'
      })
      setShowApplicationModal(false)
      reset()

      // Reload job data to update application count or status if needed
      loadJob(job.id)

    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Ứng tuyển thất bại. Vui lòng thử lại.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatSalary = (salary: any) => {
    if (typeof salary === 'string') return salary;

    if (salary?.min && salary?.max) {
      const formatNumber = (num: number) => {
        if (num >= 1000000) {
          return `${(num / 1000000).toFixed(0)} triệu`
        }
        return `${(num / 1000).toFixed(0)}K`
      }
      return `${formatNumber(salary.min)} - ${formatNumber(salary.max)} VNĐ`
    }

    return 'Thỏa thuận';
  }

  // ... (giữ nguyên logic khác)

  // Trong JSX:
  // Salary: {formatSalary(job.salary)}
  // Type: {job.type && JOB_TYPE_LABELS[job.type]}
  // ExpiresAt: {job.expiresAt ? new Date(job.expiresAt)... : 'Không thời hạn'}

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined mr-2">arrow_back</span>
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4">
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-4xl">business</span>
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    {job.company?.name}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {job.location}
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      {formatSalary(job.salary)}
                    </div>

                    {job.type && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium uppercase tracking-wide">
                        {JOB_TYPE_LABELS[job.type]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="material-symbols-outlined mr-2 text-primary">description</span>
                Mô tả công việc
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="material-symbols-outlined mr-2 text-primary">fact_check</span>
                Yêu cầu công việc
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {job.requirements}
              </div>
            </div>

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="material-symbols-outlined mr-2 text-primary">card_giftcard</span>
                  Quyền lợi
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {job.benefits}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-8">
              <button
                onClick={handleApplyClick}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-bold mb-6 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">send</span>
                Ứng tuyển ngay
              </button>

              <div className="space-y-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Số lượng ứng tuyển</span>
                  <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {job.applicationCount || 0} ứng viên
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Hạn nộp hồ sơ</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Ngày đăng</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="material-symbols-outlined mr-2 text-gray-500">business</span>
                  Thông tin công ty
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                  {job.company?.name}
                </p>
                {job.company?.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">language</span>
                    Website công ty
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ứng tuyển công việc</h2>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitApplication)}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn CV của bạn <span className="text-red-500">*</span>
                </label>

                {isLoadingCVs ? (
                  <div className="text-gray-500 text-sm flex items-center">
                    <span className="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
                    Đang tải danh sách CV...
                  </div>
                ) : cvList.length > 0 ? (
                  <select
                    {...register('cvId', { required: 'Vui lòng chọn CV để ứng tuyển' })}
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg"
                  >
                    <option value="">-- Chọn CV --</option>
                    {cvList.map(cv => (
                      <option key={cv.id} value={cv.id}>
                        {cv.fileName} {cv.isDefault ? '(Mặc định)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm flex items-center">
                    <span className="material-symbols-outlined mr-2">warning</span>
                    Bạn chưa có CV nào.
                    <button
                      type="button"
                      onClick={() => navigate('/candidate/cv-builder')}
                      className="ml-1 font-bold underline hover:text-yellow-700"
                    >
                      Tạo ngay
                    </button>
                  </div>
                )}
                {errors.cvId && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvId.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thư giới thiệu (Cover Letter)
                </label>
                <textarea
                  {...register('coverLetter')}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm py-3 px-4 focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (cvList.length === 0)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-primary/30 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi hồ sơ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
