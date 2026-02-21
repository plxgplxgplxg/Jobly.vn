import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { savedJobService, type SavedJob } from '../../services/api/saved-job.service'
import { useUIStore } from '../../store/uiStore'
import { Pagination } from '../../components/common/Pagination'

const API_BASE_URL = 'http://localhost:5001'

export function SavedJobsPage() {
    const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const ITEMS_PER_PAGE = 9
    const { addNotification } = useUIStore()

    useEffect(() => {
        fetchSavedJobs()
    }, [currentPage])

    const fetchSavedJobs = async () => {
        try {
            setLoading(true)
            const data = await savedJobService.list({ page: currentPage, limit: ITEMS_PER_PAGE })
            setSavedJobs(data.items)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.error('Failed to fetch saved jobs:', error)
            addNotification({
                type: 'error',
                message: 'Không thể tải danh sách công việc đã lưu'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUnsave = async (jobId: string) => {
        try {
            await savedJobService.toggle(jobId)
            fetchSavedJobs()
            addNotification({
                type: 'success',
                message: 'Đã bỏ lưu công việc'
            })
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'Không thể thực hiện thao tác'
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Công việc đã lưu</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Danh sách các công việc bạn đã quan tâm và lưu lại
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-primary">{savedJobs.length}</span> công việc
                </div>
            </div>

            {savedJobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400">bookmark_border</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Chưa có công việc nào được lưu</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                        Hãy khám phá các cơ hội việc làm mới và lưu lại những vị trí phù hợp với bạn nhé!
                    </p>
                    <Link
                        to="/jobs"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all gap-2"
                    >
                        <span className="material-symbols-outlined">search</span>
                        Khám phá việc làm ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedJobs.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {item.job?.company?.logoUrl ? (
                                                <img
                                                    src={item.job.company.logoUrl.startsWith('http') ? item.job.company.logoUrl : `${API_BASE_URL}${item.job.company.logoUrl}`}
                                                    alt={item.job.company.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-400 text-3xl">business</span>
                                            )}
                                        </div>
                                        <div>
                                            <Link to={`/jobs/${item.jobId}`} className="block">
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                    {item.job?.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                                                {item.job?.company?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnsave(item.jobId)}
                                        className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                        title="Bỏ lưu"
                                    >
                                        <span className="material-symbols-outlined filled text-xl">bookmark</span>
                                    </button>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        <span>{item.job?.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-lg">payments</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{item.job?.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                        <span>Đã lưu {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to={`/jobs/${item.jobId}`}
                                        className="flex-1 px-4 py-2 text-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Chi tiết
                                    </Link>
                                    <Link
                                        to={`/jobs/${item.jobId}`}
                                        className="flex-1 px-4 py-2 text-center bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Ứng tuyển
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    )
}
