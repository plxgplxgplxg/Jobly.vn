import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobService } from '../../services/api/job.service'
import { applicationService } from '../../services/api/application.service'
import type { Job } from '../../types/job.types'
import type { Application } from '../../types/api.types'
import { useUIStore } from '../../store/uiStore'

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  newApplications: number
}

interface JobWithApplications extends Job {
  applications: Application[]
}

export function EmployerDashboard() {
  const { addNotification } = useUIStore()

  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0
  })
  const [topJobs, setTopJobs] = useState<JobWithApplications[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days'>('30days')

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load jobs
      const jobs = await jobService.getMyJobs()

      // Load applications for each job
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          try {
            const applications = await applicationService.getApplicationsForJob(job.id)
            return { ...job, applications }
          } catch {
            return { ...job, applications: [] }
          }
        })
      )

      // Calculate stats
      const totalJobs = jobs.length
      const activeJobs = jobs.filter(job => job.status === 'approved').length
      const allApplications = jobsWithApplications.flatMap(job => job.applications)
      const totalApplications = allApplications.length

      // Calculate new applications based on date range
      const now = new Date()
      const daysAgo = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      const newApplications = allApplications.filter(
        app => new Date(app.createdAt) >= cutoffDate
      ).length

      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        newApplications
      })

      // Get top 5 jobs by application count
      const sortedJobs = jobsWithApplications
        .sort((a, b) => b.applications.length - a.applications.length)
        .slice(0, 5)

      setTopJobs(sortedJobs)
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải dữ liệu dashboard'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7days': return '7 ngày qua'
      case '30days': return '30 ngày qua'
      case '90days': return '90 ngày qua'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Tổng quan hoạt động tuyển dụng
            </p>
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Thời gian:
            </span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total jobs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tổng tin tuyển dụng
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalJobs}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active jobs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tin đang hoạt động
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.activeJobs}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total applications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tổng ứng viên
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalApplications}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* New applications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Ứng viên mới ({getDateRangeLabel()})
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.newApplications}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Top jobs section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Top 5 tin tuyển dụng
                </h2>
                <Link
                  to="/employer/jobs"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>

              {topJobs.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">
                    Chưa có tin tuyển dụng nào
                  </p>
                  <Link
                    to="/employer/jobs/new"
                    className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Đăng tin ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topJobs.map((job, index) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/employer/jobs/${job.id}/applications`}
                            className="block group"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {job.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {job.viewCount} lượt xem
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {job.applications.length}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ứng viên
                          </p>
                        </div>
                        <Link
                          to={`/employer/jobs/${job.id}/applications`}
                          className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm"
                        >
                          Xem
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                to="/employer/jobs/new"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Đăng tin
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tin tuyển dụng mới
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/employer/candidates"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Tìm ứng viên
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tìm hồ sơ phù hợp
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/employer/messages"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Tin nhắn
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Trao đổi với ứng viên
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/employer/profile"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Hồ sơ
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cập nhật thông tin
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
