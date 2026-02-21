import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { applicationService, type Application, type ApplicationStatus } from '../../services/api/application.service'
import { useUIStore } from '../../store/uiStore'
import { FloatingChat } from '../../components/common/FloatingChat'
import { Pagination } from '../../components/common/Pagination'

const STATUS_LABELS: Record<ApplicationStatus, { label: string; color: string }> = {
  submitted: { label: 'Đã nộp', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  pending: { label: 'Chờ xét duyệt', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  reviewing: { label: 'Đã xem', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  interview: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  accepted: { label: 'Đã chấp nhận', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: 'Đã từ chối', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  withdrawn: { label: 'Đã thu hồi', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
}

export function ApplicationManagementPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { addNotification } = useUIStore()

  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const ITEMS_PER_PAGE = 10
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [cvPreview, setCvPreview] = useState<{ url: string; name: string } | null>(null)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewCandidate, setInterviewCandidate] = useState<Application | null>(null)
  const [chatUserId, setChatUserId] = useState<string | null>(null)
  const [interviewData, setInterviewData] = useState({ date: '', time: '', location: '', note: '' })

  useEffect(() => {
    loadApplications()
  }, [jobId, currentPage, filterStatus])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      const params: any = { page: currentPage, limit: ITEMS_PER_PAGE }
      if (filterStatus !== 'all') params.status = filterStatus
      if (jobId) {
        const response = await applicationService.getApplicationsForJob(jobId, params)
        setApplications(response.items)
        setTotalPages(response.totalPages)
      } else {
        const response = await applicationService.getAllApplications(params)
        setApplications(response.items)
        setTotalPages(response.totalPages)
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải danh sách ứng viên'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (applicationId: string, status: ApplicationStatus, data?: any) => {
    try {
      setIsUpdating(true)
      const updated = await applicationService.updateApplicationStatus(applicationId, status, data)

      setApplications(applications.map(app =>
        app.id === applicationId ? updated : app
      ))

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(updated)
      }

      let message = 'Cập nhật trạng thái thành công'
      if (status === 'accepted') message = 'Đã chấp nhận ứng viên'
      if (status === 'rejected') message = 'Đã từ chối ứng viên'
      if (status === 'interview') message = 'Đã gửi lịch phỏng vấn'

      addNotification({
        type: 'success',
        message
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

  const handleViewCV = (application: Application) => {
    setCvPreview({
      url: application.cvUrl,
      name: application.cvName || 'CV'
    })
  }

  const handleSendMessage = (application: Application) => {
    setChatUserId(application.candidateId)
  }

  const handleScheduleInterview = (application: Application) => {
    setInterviewCandidate(application)
    if (application.interviewDate) {
      setInterviewData({
        date: new Date(application.interviewDate).toISOString().split('T')[0],
        time: application.interviewTime || '',
        location: application.interviewLocation || '',
        note: application.interviewNote || ''
      })
    } else {
      setInterviewData({ date: '', time: '', location: '', note: '' })
    }
    setShowInterviewModal(true)
  }

  const submitInterview = async () => {
    if (!interviewCandidate) return
    if (!interviewData.date || !interviewData.time || !interviewData.location) {
      addNotification({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin bắt buộc' })
      return
    }

    await handleUpdateStatus(interviewCandidate.id, 'interview', {
      interviewDate: interviewData.date,
      interviewTime: interviewData.time,
      interviewLocation: interviewData.location,
      interviewNote: interviewData.note
    })

    setShowInterviewModal(false)
    setInterviewCandidate(null)
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const jobTitle = applications[0]?.job?.title || ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={jobId ? "/employer/jobs" : "/employer/dashboard"}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {jobId ? 'Quay lại danh sách tin' : 'Quay lại bảng điều khiển'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý ứng viên
          </h1>
          {jobId && jobTitle && (
            <p className="text-gray-600 dark:text-gray-400">
              {jobTitle}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFilterStatus('all'); setCurrentPage(1) }}
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
                  onClick={() => { setFilterStatus(status); setCurrentPage(1) }}
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
        {!isLoading && applications.length === 0 && (
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
        {!isLoading && applications.length > 0 && (
          <div className="space-y-4">
            {applications.map((application) => (
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
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Primary actions */}
                      <button
                        onClick={() => handleViewCV(application)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Xem CV
                      </button>

                      <button
                        onClick={() => handleSendMessage(application)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Nhắn tin
                      </button>

                      <button
                        onClick={() => handleScheduleInterview(application)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Hẹn phỏng vấn
                      </button>

                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chi tiết
                      </button>

                      {/* Status action buttons */}
                      <div className="ml-auto flex gap-2">
                        {['submitted', 'pending', 'reviewed', 'interview'].includes(application.status) && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(application.id, 'rejected');
                              }}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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

                {/* Interview Info */}
                {selectedApplication.interviewDate && (
                  <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Lịch phỏng vấn
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Ngày:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedApplication.interviewDate)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Thời gian:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.interviewTime}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Địa điểm/Link:</span>
                        <p className="font-medium text-gray-900 dark:text-white break-all">{selectedApplication.interviewLocation}</p>
                      </div>
                      {selectedApplication.interviewNote && (
                        <div className="md:col-span-2">
                          <span className="text-gray-500 dark:text-gray-400 block mb-1">Ghi chú:</span>
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedApplication.interviewNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <a
                    href={`/employer/candidates/${selectedApplication.candidateId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
                  >
                    Xem hồ sơ ứng viên
                  </a>

                  {['submitted', 'pending', 'reviewed', 'interview'].includes(selectedApplication.status) && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          handleScheduleInterview(selectedApplication)
                          setSelectedApplication(null)
                        }}
                        disabled={isUpdating}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Hẹn phỏng vấn
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
          </div>
        )}
      </div>

      {/* CV Preview Modal */}
      {cvPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {cvPreview.name}
              </h3>
              <button
                onClick={() => setCvPreview(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {cvPreview.url.endsWith('.pdf') ? (
                <iframe
                  src={cvPreview.url}
                  className="w-full h-full min-h-[600px]"
                  title="CV Preview"
                />
              ) : (
                <img
                  src={cvPreview.url}
                  alt="CV Preview"
                  className="w-full h-auto"
                />
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <a
                href={cvPreview.url}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Tải xuống
              </a>
              <button
                onClick={() => setCvPreview(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && interviewCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {interviewCandidate?.status === 'interview' ? 'Cập nhật lịch phỏng vấn' : 'Hẹn phỏng vấn'}
              </h3>
              <button
                onClick={() => {
                  setShowInterviewModal(false)
                  setInterviewCandidate(null)
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Ứng viên: <span className="font-medium text-gray-900 dark:text-white">{interviewCandidate.candidate?.name}</span>
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ngày phỏng vấn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={interviewData.date}
                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thời gian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={interviewData.time}
                    onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa điểm / Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={interviewData.location}
                    onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                    placeholder="Nhập địa điểm hoặc link phỏng vấn online"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    rows={3}
                    value={interviewData.note}
                    onChange={(e) => setInterviewData({ ...interviewData, note: e.target.value })}
                    placeholder="Thông tin thêm về buổi phỏng vấn..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowInterviewModal(false)
                  setInterviewCandidate(null)
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={submitInterview}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {interviewCandidate?.status === 'interview' ? 'Cập nhật' : 'Gửi lời mời'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat */}
      <FloatingChat
        userId={chatUserId}
        onClose={() => setChatUserId(null)}
      />
    </div>
  )
}
