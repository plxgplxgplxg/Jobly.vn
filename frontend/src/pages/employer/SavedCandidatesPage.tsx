import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { savedCandidateService, type SavedCandidate } from '../../services/api/saved-candidate.service'
import { useUIStore } from '../../store/uiStore'
import { Pagination } from '../../components/common/Pagination'

const API_BASE_URL = 'http://localhost:5001'

export function SavedCandidatesPage() {
    const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const ITEMS_PER_PAGE = 9
    const { addNotification } = useUIStore()

    useEffect(() => {
        fetchSavedCandidates()
    }, [currentPage])

    const fetchSavedCandidates = async () => {
        try {
            setLoading(true)
            const data = await savedCandidateService.list({ page: currentPage, limit: ITEMS_PER_PAGE })
            setSavedCandidates(data.items)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.error('Failed to fetch saved candidates:', error)
            addNotification({
                type: 'error',
                message: 'Không thể tải danh sách ứng viên đã lưu'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUnsave = async (candidateId: string) => {
        try {
            await savedCandidateService.toggle(candidateId)
            fetchSavedCandidates()
            addNotification({
                type: 'success',
                message: 'Đã bỏ lưu hồ sơ ứng viên'
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Ứng viên đã lưu</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Danh sách các hồ sơ ứng viên bạn đã lưu để xem xét sau
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-primary">{savedCandidates.length}</span> ứng viên
                </div>
            </div>

            {savedCandidates.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400">group_add</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Chưa có ứng viên nào được lưu</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                        Hãy tìm kiếm những tài năng phù hợp và lưu lại hồ sơ của họ để tiện liên hệ nhé!
                    </p>
                    <Link
                        to="/employer/candidates"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all gap-2"
                    >
                        <span className="material-symbols-outlined">search</span>
                        Tìm kiếm ứng viên ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {savedCandidates.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {item.candidate?.avatarUrl ? (
                                                <img
                                                    src={item.candidate.avatarUrl.startsWith('http') ? item.candidate.avatarUrl : `${API_BASE_URL}${item.candidate.avatarUrl}`}
                                                    alt={item.candidate.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-400 text-4xl">person</span>
                                            )}
                                        </div>
                                        <div>
                                            <Link to={`/employer/candidates/${item.candidateId}`} className="block">
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-lg">
                                                    {item.candidate?.name}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {item.candidate?.desiredPosition || 'Chưa cập nhật vị trí'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnsave(item.candidateId)}
                                        className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined filled text-xl">bookmark</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Kinh nghiệm</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.candidate?.experienceLevel || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Mức lương mong muốn</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.candidate?.expectedSalary || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        <span>{item.candidate?.province ? `${item.candidate.district}, ${item.candidate.province}` : 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                        <span>Đã lưu vào {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to={`/employer/candidates/${item.candidateId}`}
                                        className="flex-1 px-4 py-2 text-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Xem hồ sơ
                                    </Link>
                                    <button
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Liên hệ
                                    </button>
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
