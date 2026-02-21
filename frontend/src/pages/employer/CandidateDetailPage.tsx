import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { candidateService } from '../../services/api/candidate.service'
import type { UserProfile } from '../../types/user.types'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore, UserRole } from '../../store/authStore'
import { savedCandidateService } from '../../services/api/saved-candidate.service'

export function CandidateDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addNotification } = useUIStore()

    const [candidate, setCandidate] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)
    const { user, isAuthenticated } = useAuthStore()

    useEffect(() => {
        if (id) {
            loadProfile()
            if (isAuthenticated && user?.role === UserRole.EMPLOYER) {
                checkSaveStatus()
            }
        }
    }, [id, isAuthenticated, user])

    const loadProfile = async () => {
        try {
            if (!id) return
            setIsLoading(true)
            const data = await candidateService.getCandidateProfile(id)
            setCandidate(data)
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: 'Không thể tải hồ sơ ứng viên'
            })
            navigate('/employer/candidates')
        } finally {
            setIsLoading(false)
        }
    }

    const checkSaveStatus = async () => {
        if (!id) return
        try {
            const { saved } = await savedCandidateService.checkStatus(id)
            setIsSaved(saved)
        } catch (e) { console.error(e) }
    }

    const handleToggleSave = async () => {
        if (!isAuthenticated) {
            navigate('/auth/login', { state: { returnUrl: `/employer/candidates/${id}` } })
            return
        }
        if (!id) return
        try {
            const { saved } = await savedCandidateService.toggle(id)
            setIsSaved(saved)
            addNotification({
                type: 'success',
                message: saved ? 'Đã lưu hồ sơ ứng viên' : 'Đã bỏ lưu hồ sơ ứng viên'
            })
        } catch (e) {
            console.error(e)
            addNotification({ type: 'error', message: 'Có lỗi xảy ra khi thực hiện thao tác' })
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!candidate) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                {candidate.avatarUrl ? (
                                    <img
                                        src={candidate.avatarUrl}
                                        alt={candidate.name}
                                        className="w-32 h-32 rounded-3xl object-cover ring-4 ring-gray-50 dark:ring-gray-700 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-3xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-4xl ring-4 ring-gray-50 dark:ring-gray-700 shadow-lg">
                                        {candidate.name[0]}
                                    </div>
                                )}
                                <div className="flex-1 text-center sm:text-left">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {candidate.name}
                                    </h1>
                                    <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
                                        {candidate.desiredPosition || 'Chưa cập nhật vị trí'}
                                    </p>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            {candidate.address || 'Hà Nội'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {candidate.experienceLevel || '1-3 năm kinh nghiệm'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Experience / Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Giới thiệu & Kinh nghiệm
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                                {candidate.experience ? (
                                    <div className="whitespace-pre-wrap">{candidate.experience}</div>
                                ) : (
                                    <p>Thông tin đang được cập nhật...</p>
                                )}
                            </div>
                        </div>

                        {/* CV Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Hồ sơ CV
                            </h2>
                            {candidate.cvs && candidate.cvs.length > 0 ? (
                                <div className="space-y-3">
                                    {candidate.cvs.map((cv: any) => (
                                        <div key={cv.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-purple-50 dark:from-primary/10 dark:to-purple-900/20 rounded-xl border border-primary/20 hover:border-primary/40 transition-all group">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                                        {cv.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Cập nhật: {new Date(cv.updatedAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={cv.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-semibold flex items-center gap-2 flex-shrink-0"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Xem CV
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                                        Ứng viên chưa tải lên CV nào
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                Thông tin chi tiết
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Mức lương mong muốn</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{candidate.expectedSalary || 'Thỏa thuận'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Loại công việc</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{candidate.workType || 'Toàn thời gian'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Cấp bậc</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{candidate.jobLevel || 'Nhân viên'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Giới tính</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{candidate.gender === 'male' ? 'Nam' : candidate.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={() => navigate(`/employer/messages?user=${candidate.id}`)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Nhắn tin ngay
                                </button>
                                {user?.role === UserRole.EMPLOYER && (
                                    <button
                                        onClick={handleToggleSave}
                                        className={`w-full py-3 border-2 ${isSaved ? 'border-pink-500 text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'} font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:border-pink-500 hover:text-pink-500`}
                                    >
                                        <span className="material-symbols-outlined" style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                                        {isSaved ? 'Đã lưu hồ sơ' : 'Lưu hồ sơ'}
                                    </button>
                                )}
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 mb-1">Email liên hệ</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{candidate.email}</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{candidate.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
