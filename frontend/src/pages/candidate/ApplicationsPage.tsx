import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationService } from '../../services/api/application.service'
import type { Application, ApplicationStatus } from '../../types/api.types'
import { useUIStore } from '../../store/uiStore'
import { CVPreviewModal } from '../../components/common/CVPreviewModal'
import { API_BASE_URL } from '../../constants/api'
import { EditApplicationModal } from '../../components/application/EditApplicationModal'
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



export function ApplicationsPage() {
  const { addNotification } = useUIStore()

  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const ITEMS_PER_PAGE = 10
  const [selectedCvUrl, setSelectedCvUrl] = useState<string | null>(null)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [chatUserId, setChatUserId] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [currentPage, filterStatus])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      const params: any = { page: currentPage, limit: ITEMS_PER_PAGE }
      if (filterStatus !== 'all') params.status = filterStatus
      const data = await applicationService.getMyApplications(params)
      setApplications(data.items)
      setTotalPages(data.totalPages)
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải danh sách ứng tuyển'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Việc làm đã ứng tuyển
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý và theo dõi trạng thái các đơn ứng tuyển của bạn
          </p>
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

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && applications.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filterStatus === 'all' ? 'Chưa có đơn ứng tuyển nào' : 'Không có đơn ứng tuyển nào'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterStatus === 'all'
                ? 'Hãy tìm kiếm và ứng tuyển công việc phù hợp với bạn'
                : 'Thử thay đổi bộ lọc để xem các đơn ứng tuyển khác'
              }
            </p>
            {filterStatus === 'all' && (
              <Link
                to="/jobs"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Tìm việc làm
              </Link>
            )}
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
                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                      {application.job ? (
                        <div className="flex items-start gap-4">
                          {/* Company logo */}
                          {application.job.company?.logoUrl ? (
                            <img
                              src={application.job.company.logoUrl.startsWith('http') ? application.job.company.logoUrl : `${API_BASE_URL}${application.job.company.logoUrl}`}
                              alt={application.job.company.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                              </svg>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/jobs/${application.job.id}`}
                              className="block group"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {application.job.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {application.job.company?.name || 'Công ty ẩn danh'}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ứng tuyển: {formatDate(application.createdAt)}
                              </div>

                              {application.updatedAt !== application.createdAt && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Cập nhật: {formatDate(application.updatedAt)}
                                </div>
                              )}
                            </div>

                            {application.coverLetter && (
                              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {application.coverLetter}
                              </p>
                            )}

                            {/* Interview details */}
                            {application.status === 'interview' && (
                              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                                <h4 className="flex items-center gap-2 font-medium text-purple-900 dark:text-purple-100 mb-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Lịch hẹn phỏng vấn
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800 dark:text-purple-200">
                                  <div>
                                    <span className="font-medium">Ngày:</span> {application.interviewDate ? formatDate(application.interviewDate) : 'Chưa cập nhật'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Thời gian:</span> {application.interviewTime || 'Chưa cập nhật'}
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="font-medium">Địa điểm/Link:</span> <span className="font-medium">{application.interviewLocation || 'Chưa cập nhật'}</span>
                                  </div>
                                  {application.interviewNote && (
                                    <div className="md:col-span-2">
                                      <span className="font-medium">Ghi chú:</span> {application.interviewNote}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Rejected status info */}
                            {application.status === 'rejected' && (
                              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
                                <span className="font-medium">Hồ sơ của bạn đã bị từ chối.</span> Bạn có thể cập nhật hồ sơ để ứng tuyển lại.
                              </div>
                            )}

                            {/* Actions buttons */}
                            <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <button
                                onClick={() => setEditingApplication(application)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Cập nhật hồ sơ
                              </button>

                              <button
                                onClick={() => {
                                  if (application.job.company?.userId) {
                                    setChatUserId(application.job.company.userId)
                                  } else {
                                    addNotification({
                                      type: 'error',
                                      message: 'Không thể nhắn tin (Thiếu thông tin người dùng)'
                                    })
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Nhắn tin
                              </button>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 text-gray-500 italic">
                          <span>Công việc không còn tồn tại hoặc đã bị xóa</span>
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_LABELS[application.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[application.status]?.label || application.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>CV: {application.cvName || 'CV đã nộp'}</span>
                    </div>
                    {application.cvUrl && (
                      <button
                        onClick={() => setSelectedCvUrl(application.cvUrl)}
                        className="text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
                      >
                        Xem CV →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {selectedCvUrl && (
        <CVPreviewModal
          url={selectedCvUrl.startsWith('http') ? selectedCvUrl : `${API_BASE_URL}${selectedCvUrl}`}
          fileName="CV ứng tuyển"
          isOpen={true}
          onClose={() => setSelectedCvUrl(null)}
        />
      )}

      {/* Edit Modal */}
      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          isOpen={true}
          onClose={() => setEditingApplication(null)}
          onSuccess={() => {
            loadApplications();
            setEditingApplication(null);
          }}
        />
      )}

      {/* Chat */}
      {chatUserId && (
        <FloatingChat
          userId={chatUserId}
          onClose={() => setChatUserId(null)}
        />
      )}
    </div>
  )
}
