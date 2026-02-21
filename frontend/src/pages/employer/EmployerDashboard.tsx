import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobService } from '../../services/api/job.service'
import { applicationService } from '../../services/api/application.service'
import { userService } from '../../services/api/user.service'
import type { Job } from '../../types/job.types'
import type { Application } from '../../types/api.types'
import { useUIStore } from '../../store/uiStore'

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  newApplications: number
  savedCandidates: number
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
    newApplications: 0,
    savedCandidates: 0
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
      const jobsResponse = await jobService.getMyJobs({ page: 1, limit: 100 })
      const jobs = jobsResponse.items

      // Load applications for each job
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          try {
            const data = await applicationService.getApplicationsForJob(job.id)
            return { ...job, applications: data.items || [] }
          } catch {
            return { ...job, applications: [] }
          }
        })
      )

      // Calculate stats
      const totalJobs = jobsResponse.total
      const activeJobs = jobs.filter(job => job.status === 'approved').length
      const allApplications = jobsWithApplications.flatMap(job => job.applications)
      const totalApplications = allApplications.length

      // Load additional stats from userService
      const backendStats = await userService.getDashboardStats()
      const savedCandidates = backendStats.savedJobs // Mapped in backend

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
        newApplications,
        savedCandidates
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


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Bảng điều khiển</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Tổng quan hoạt động tuyển dụng của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Hiển thị dữ liệu:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">work</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">Active</span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tin biểu dụng</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalJobs}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">group</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">Total</span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng ứng viên</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalApplications}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">person_add</span>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg">New</span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ứng viên mới</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.newApplications}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">bookmark</span>
                </div>
                <Link to="/employer/saved-candidates" className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</Link>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ứng viên đã lưu</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.savedCandidates}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">trending_up</span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tỉ lệ phản hồi</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">94%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Jobs */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white text-lg">Tin tuyển dụng nổi bật</h2>
                <Link to="/employer/jobs" className="text-sm font-medium text-primary hover:underline">Quản lý tin</Link>
              </div>

              {topJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">Bạn chưa đăng tin tuyển dụng nào.</p>
                  <Link to="/employer/jobs/new" className="text-primary font-bold mt-2 inline-block">Đăng tin ngay</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topJobs.map((job, index) => (
                    <div key={job.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400">
                          {index + 1}
                        </div>
                        <div>
                          <Link to={`/employer/jobs/${job.id}/applications`} className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              {job.viewCount || 0} lượt xem
                            </span>
                            <span className="flex items-center gap-1 text-primary">
                              <span className="material-symbols-outlined text-sm">person</span>
                              {job.applications.length} ứng viên
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/employer/jobs/${job.id}/applications`}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Hành động nhanh</h2>
                <div className="space-y-3">
                  <Link to="/employer/jobs/new" className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">post_add</span>
                    <span className="font-bold">Đăng tin tuyển dụng</span>
                  </Link>
                  <Link to="/employer/candidates" className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all group">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">search</span>
                    <span className="font-bold">Tìm kiếm ứng viên</span>
                  </Link>
                  <Link to="/employer/saved-candidates" className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all group">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">bookmark</span>
                    <span className="font-bold">Ứng viên đã lưu</span>
                  </Link>
                  <Link to="/employer/profile" className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">business</span>
                    <span className="font-bold">Hồ sơ công ty</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
