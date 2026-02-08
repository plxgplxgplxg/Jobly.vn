import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { applicationService } from '../../services/api/application.service'
import { userService } from '../../services/api/user.service'
import { jobService } from '../../services/api/job.service'
import type { Application } from '../../types/api.types'
import type { Job } from '../../services/api/job.service'

export function CandidateDashboard() {
    const { user } = useAuthStore()
    const [stats, setStats] = useState([
        { label: 'Đơn ứng tuyển', value: '...', icon: 'description', color: 'blue' },
        { label: 'Công việc đã lưu', value: '...', icon: 'bookmark', color: 'green' },
        { label: 'CV đã tải lên', value: '...', icon: 'insert_drive_file', color: 'purple' },
        { label: 'Tin nhắn mới', value: '...', icon: 'mail', color: 'orange' },
    ])
    const [recentApplications, setRecentApplications] = useState<Application[]>([])
    const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true)

                // Fetch stats
                const statsData = await userService.getDashboardStats()
                setStats([
                    { label: 'Đơn ứng tuyển', value: statsData.applications.toString(), icon: 'description', color: 'blue' },
                    { label: 'Công việc đã lưu', value: statsData.savedJobs.toString(), icon: 'bookmark', color: 'green' },
                    { label: 'CV đã tải lên', value: statsData.cvs.toString(), icon: 'insert_drive_file', color: 'purple' },
                    { label: 'Tin nhắn mới', value: statsData.messages.toString(), icon: 'mail', color: 'orange' },
                ])

                // Fetch recent applications
                const appsResponse = await applicationService.getMyApplications({ limit: 3 })
                setRecentApplications(appsResponse.items)

                // Fetch recommended jobs (just latest jobs for now)
                const jobsResponse = await jobService.searchJobs({ limit: 3 })
                setRecommendedJobs(jobsResponse.jobs as any)

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'reviewing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ xử lý'
            case 'reviewing': return 'Đang xem xét'
            case 'accepted': return 'Đã chấp nhận'
            case 'rejected': return 'Đã từ chối'
            default: return status
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Xin chào, {user?.name}! 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Chào mừng bạn quay trở lại. Đây là tổng quan về hoạt động của bạn.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900 flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                    {stat.icon}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Hành động nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/jobs"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition-all flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-2xl">search</span>
                        <span className="font-medium">Tìm việc làm</span>
                    </Link>
                    <Link
                        to="/candidate/cv-builder"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition-all flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-2xl">description</span>
                        <span className="font-medium">Tạo CV mới</span>
                    </Link>
                    <Link
                        to="/candidate/profile"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition-all flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-2xl">person</span>
                        <span className="font-medium">Cập nhật hồ sơ</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Applications */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Đơn ứng tuyển gần đây
                        </h2>
                        <Link to="/candidate/applications" className="text-primary font-medium hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentApplications.length > 0 ? (
                            recentApplications.map((app) => (
                                <div
                                    key={app.id}
                                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{app.job?.title}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{app.job?.company?.name}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                            {getStatusText(app.status)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500">Bạn chưa ứng tuyển công việc nào.</p>
                                <Link to="/jobs" className="text-primary hover:underline mt-2 inline-block">Tìm việc ngay</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommended Jobs */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Việc làm phù hợp
                        </h2>
                        <Link to="/jobs" className="text-primary font-medium hover:underline">
                            Xem thêm
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recommendedJobs.length > 0 ? (
                            recommendedJobs.map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/jobs/${job.id}`}
                                    className="block p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md transition-all"
                                >
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{job.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{job.companyName}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">payments</span>
                                            {job.salary}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {job.location}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500">Chưa có việc làm phù hợp dành cho bạn.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

