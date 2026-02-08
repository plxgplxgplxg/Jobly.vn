import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { candidateService } from '../../services/api/candidate.service'
import type { UserProfile } from '../../types/user.types'
import { useUIStore } from '../../store/uiStore'

export function CandidateSearchPage() {
    const { addNotification } = useUIStore()
    const [candidates, setCandidates] = useState<UserProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        handleSearch()
    }, [])

    const handleSearch = async () => {
        try {
            setIsLoading(true)
            const data = await candidateService.searchCandidates(searchQuery)
            setCandidates(data)
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: 'Không thể tìm kiếm ứng viên'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Tìm kiếm ứng viên
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tìm kiếm những tài năng phù hợp nhất cho doanh nghiệp của bạn
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Tìm theo tên, kỹ năng, vị trí..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.length > 0 ? (
                            candidates.map((candidate) => (
                                <Link
                                    key={candidate.id}
                                    to={`/employer/candidates/${candidate.id}`}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            {candidate.avatarUrl ? (
                                                <img
                                                    src={candidate.avatarUrl}
                                                    alt={candidate.name}
                                                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-50 dark:ring-gray-700 group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl ring-2 ring-gray-50 dark:ring-gray-700 group-hover:scale-105 transition-transform duration-300">
                                                    {candidate.name[0]}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                                    {candidate.name}
                                                </h3>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                                    {candidate.desiredPosition || 'Chưa cập nhật vị trí'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="truncate">{candidate.experienceLevel || 'Chưa cập nhật kinh nghiệm'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span className="truncate">{candidate.address || 'Chưa cập nhật địa chỉ'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                            <div className="text-xs font-semibold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md">
                                                {candidate.industry || 'Đa ngành'}
                                            </div>
                                            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                Xem hồ sơ
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy ứng viên nào</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                    Hãy thử tìm kiếm với từ khóa khác hoặc lọc theo các tiêu chí mong muốn.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
