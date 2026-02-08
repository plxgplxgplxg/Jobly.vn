import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { applicationService, type Application, type ApplicationStatus } from '../../services/api/application.service'
import { useUIStore } from '../../store/uiStore'

const STATUS_LABELS: Record<ApplicationStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ xét duyệt', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  reviewed: { label: 'Đã xem', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  accepted: { label: 'Đã chấp nhận', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: 'Đã từ chối', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
}

export function ApplicationManagementPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { addNotification } = useUIStore()

  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (jobId) {
      loadApplications()
    }
  }, [jobId])

  const loadApplications = async () => {
    if (!jobId) return

    try {
      setIsLoading(true)
      const data = await applicationService.getApplicationsForJob(jobId)
      setApplications(data)
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải danh sách ứng viên'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      setIsUpdating(true)
      const updated = await applicationService.updateApplicationStatus(applicationId, status)

      setApplications(applications.map(app =>
        app.id === applicationId ? updated : app
      ))

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(updated)
      }

      addNotification({
        type: 'success',
        message: `Đã ${status === 'accepted' ? 'chấp nhận' : 'từ chối'} ứng viên`
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể cập nhật trạng thái'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const jobTitle = applications[0]?.job?.title || 'Tin tuyển dụng'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/employer/jobs"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách tin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý ứng viên
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {jobTitle}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Tất cả ({applications.length})
            </button>
            {Object.entries(STATUS_LABELS).map(([status, { label }]) => {
              const count = applications.filter(app => app.status === status).length
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredApplications.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filterStatus === 'all' ? 'Chưa có ứng viên nào' : 'Không có ứng viên nào'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterStatus === 'all'
                ? 'Chưa có ứng viên nào ứng tuyển vào vị trí này'
                : 'Thử thay đổi bộ lọc để xem các ứng viên khác'
              }
            </p>
          </div>
        )}

        {/* Applications list */}
        {!isLoading && filteredApplications.length > 0 && (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Candidate info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        {application.candidate.avatarUrl ? (
                          <img
                            src={application.candidate.avatarUrl}
                            alt={application.candidate.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                              {application.candidate.name[0]}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {application.candidate.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {application.candidate.email}
                            </div>

                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {application.candidate.phone}
                            </div>

                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Ứng tuyển: {formatDate(application.createdAt)}
                            </div>
                          </div>

                          {application.coverLetter && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Thư xin việc:
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_LABELS[application.status].color}`}>
                        {STATUS_LABELS[application.status].label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <a
                        href={application.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Xem CV
                      </a>

                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chi tiết
                      </button>
                    </div>

                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application detail modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Chi tiết ứng viên
                    </h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_LABELS[selectedApplication.status].color}`}>
                      {STATUS_LABELS[selectedApplication.status].label}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Candidate info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Thông tin ứng viên
                  </h4>
                  <div className="flex items-start gap-4">
                    {selectedApplication.candidate.avatarUrl ? (
                      <img
                        src={selectedApplication.candidate.avatarUrl}
                        alt={selectedApplication.candidate.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                          {selectedApplication.candidate.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedApplication.candidate.name}
                      </h5>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {selectedApplication.candidate.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedApplication.candidate.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover letter */}
                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Thư xin việc
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                {/* CV */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    CV đính kèm
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedApplication.cvName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ứng tuyển: {formatDate(selectedApplication.createdAt)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedApplication.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      Xem CV
                    </a>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Lịch sử
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Ứng tuyển
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(selectedApplication.createdAt)}
                        </p>
                      </div>
                    </div>
                    {selectedApplication.updatedAt !== selectedApplication.createdAt && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-600"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Cập nhật trạng thái
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(selectedApplication.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedApplication.id, 'accepted')
                        setSelectedApplication(null)
                      }}
                      disabled={isUpdating}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Chấp nhận ứng viên
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedApplication.id, 'rejected')
                        setSelectedApplication(null)
                      }}
                      disabled={isUpdating}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Từ chối ứng viên
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
