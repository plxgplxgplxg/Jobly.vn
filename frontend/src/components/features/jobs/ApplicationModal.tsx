import { useState, useEffect } from 'react'
import { userService } from '../../../services/api/user.service'
import { applicationService } from '../../../services/api/application.service'
import type { Job } from '../../../types/job.types'
import type { CV } from '../../../types/user.types'
import { useUIStore } from '../../../store/uiStore'

interface ApplicationModalProps {
  job: Job
  onClose: () => void
  onSuccess: () => void
}

export function ApplicationModal({ job, onClose, onSuccess }: ApplicationModalProps) {
  const { addNotification } = useUIStore()

  const [cvList, setCvList] = useState<CV[]>([])
  const [selectedCvId, setSelectedCvId] = useState<string>('')
  const [coverLetter, setCoverLetter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCVs, setIsLoadingCVs] = useState(true)

  useEffect(() => {
    loadCVs()
  }, [])

  const loadCVs = async () => {
    try {
      setIsLoadingCVs(true)
      const cvs = await userService.getMyCVs()
      setCvList(cvs)

      // Auto-select default CV
      const defaultCV = cvs.find(cv => cv.isDefault)
      if (defaultCV) {
        setSelectedCvId(defaultCV.id)
      } else if (cvs.length > 0) {
        setSelectedCvId(cvs[0].id)
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải danh sách CV'
      })
    } finally {
      setIsLoadingCVs(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCvId) {
      addNotification({
        type: 'error',
        message: 'Vui lòng chọn CV để ứng tuyển'
      })
      return
    }

    try {
      setIsLoading(true)
      await applicationService.applyJob({
        jobId: job.id,
        cvId: selectedCvId,
        cvType: 'uploaded',
        coverLetter
      })

      addNotification({
        type: 'success',
        message: 'Ứng tuyển thành công!'
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể ứng tuyển. Vui lòng thử lại.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ứng tuyển: {job.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {job.company.name} • {job.location}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* CV Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn CV <span className="text-red-500">*</span>
            </label>

            {isLoadingCVs ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : cvList.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Bạn chưa có CV nào
                </p>
                <a
                  href="/candidate/cv-management"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Tải lên CV ngay →
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {cvList.map((cv) => (
                  <label
                    key={cv.id}
                    className={`
                      flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                      ${selectedCvId === cv.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="cv"
                      value={cv.id}
                      checked={selectedCvId === cv.id}
                      onChange={(e) => setSelectedCvId(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {cv.fileName}
                        </p>
                        {cv.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {(cv.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(cv.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <a
                      href={cv.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Xem
                    </a>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thư xin việc (không bắt buộc)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              placeholder="Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {coverLetter.length} / 1000 ký tự
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedCvId || cvList.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Đang gửi...' : 'Ứng tuyển'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
