import { useState, useEffect } from 'react'
import { adminService } from '../../services/api/admin.service'
import type { Job } from '../../services/api/job.service'

export default function JobApprovalPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showModal, setShowModal] = useState(false)

  const limit = 20

  useEffect(() => {
    loadPendingJobs()
  }, [page])

  const loadPendingJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getPendingJobs(page, limit)
      setJobs(response.data)
      setTotal(response.total)
    } catch (err) {
      setError('Không thể tải danh sách tin tuyển dụng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  const handleApprove = async (jobId: string) => {
    try {
      await adminService.approveJob(jobId, 'approved')
      setJobs(jobs.filter(job => job.id !== jobId))
      setTotal(total - 1)
      setShowModal(false)
      setSelectedJob(null)
    } catch (err) {
      setError('Không thể duyệt tin tuyển dụng')
      console.error(err)
    }
  }

  const handleReject = async (jobId: string) => {
    try {
      await adminService.approveJob(jobId, 'rejected')
      setJobs(jobs.filter(job => job.id !== jobId))
      setTotal(total - 1)
      setShowModal(false)
      setSelectedJob(null)
    } catch (err) {
      setError('Không thể từ chối tin tuyển dụng')
      console.error(err)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Duyệt Tin tuyển dụng</h1>
        <p className="text-gray-600">Xem xét và phê duyệt các tin tuyển dụng chờ duyệt</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">Không có tin tuyển dụng nào chờ duyệt</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.company?.name || 'Công ty'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📍 {job.location}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>💰 {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()} VND</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {job.type === 'full_time' ? 'Toàn thời gian' :
                       job.type === 'part_time' ? 'Bán thời gian' :
                       job.type === 'contract' ? 'Hợp đồng' : 'Thực tập'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(job)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin công ty</h3>
                <p className="text-gray-700">{selectedJob.company?.name || 'Công ty'}</p>
                <p className="text-gray-600 text-sm">{selectedJob.company?.address}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả công việc</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Yêu cầu</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.requirements}</p>
              </div>

              {selectedJob.benefits && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quyền lợi</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.benefits}</p>
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mức lương</p>
                  <p className="text-gray-900 font-medium">
                    {selectedJob.salary?.min?.toLocaleString()} - {selectedJob.salary?.max?.toLocaleString()} VND
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa điểm</p>
                  <p className="text-gray-900 font-medium">{selectedJob.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loại hình</p>
                  <p className="text-gray-900 font-medium">
                    {selectedJob.type === 'full_time' ? 'Toàn thời gian' :
                     selectedJob.type === 'part_time' ? 'Bán thời gian' :
                     selectedJob.type === 'contract' ? 'Hợp đồng' : 'Thực tập'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hết hạn</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedJob.expiresAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedJob.id)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Phê duyệt
                </button>
                <button
                  onClick={() => handleReject(selectedJob.id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
