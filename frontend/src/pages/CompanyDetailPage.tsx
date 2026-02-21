import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { companyService, type Company, type Job } from '../services/api/company.service'
import { useUIStore } from '../store/uiStore'

export function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addNotification } = useUIStore()

    const [company, setCompany] = useState<Company | null>(null)
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        if (id) {
            loadCompanyData()
        }
    }, [id, page])

    const loadCompanyData = async () => {
        if (!id) return

        try {
            setIsLoading(true)
            const response = await companyService.getCompanyJobs(id, {
                page,
                limit: 10
            })

            setCompany(response.company)
            setJobs(response.jobs)
            setTotalPages(response.pagination.totalPages)
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.error || 'Không thể tải thông tin công ty'
            })
            navigate('/companies')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!company) {
        return null
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/companies')}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary mb-6"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>Quay lại danh sách</span>
                </button>

                {/* Company Header */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 mb-8">
                    <div className="flex items-start gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            {company.logoUrl ? (
                                <img
                                    src={company.logoUrl}
                                    alt={company.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <span className="material-symbols-outlined text-slate-400 text-5xl">
                                    business
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                {company.name}
                            </h1>

                            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                    <span>{company.industry}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">badge</span>
                                    <span>MST: {company.taxCode}</span>
                                </div>
                            </div>

                            {company.description && (
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {company.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Jobs Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                        Vị trí đang tuyển ({jobs.length})
                    </h2>

                    {jobs.length > 0 ? (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                            {job.title}
                                        </h3>
                                        {job.salary && (
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                                                {job.salary}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            <span>Hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>

                                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                                        {job.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">
                                work_off
                            </span>
                            <p className="text-slate-600 dark:text-slate-400">
                                Công ty hiện không có vị trí tuyển dụng nào
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Trước
                            </button>

                            <span className="px-4 py-2 text-slate-700 dark:text-slate-300">
                                Trang {page} / {totalPages}
                            </span>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
