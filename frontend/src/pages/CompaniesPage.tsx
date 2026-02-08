import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { companyService, type Company } from '../services/api/company.service'
import { useUIStore } from '../store/uiStore'

export function CompaniesPage() {
    const navigate = useNavigate()
    const { addNotification } = useUIStore()

    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        loadCompanies()
    }, [page, search])

    const loadCompanies = async () => {
        try {
            setIsLoading(true)
            const response = await companyService.getCompanies({
                page,
                limit: 12,
                search: search || undefined
            })

            setCompanies(response.companies)
            setTotalPages(response.pagination.totalPages)
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.error || 'Không thể tải danh sách công ty'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        loadCompanies()
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Danh sách công ty
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Khám phá các nhà tuyển dụng hàng đầu
                    </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm công ty..."
                            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </form>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Companies Grid */}
                {!isLoading && companies.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                onClick={() => navigate(`/companies/${company.id}`)}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all cursor-pointer group"
                            >
                                {/* Logo */}
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {company.logoUrl ? (
                                        <img
                                            src={company.logoUrl}
                                            alt={company.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-400 text-3xl">
                                            business
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary transition-colors">
                                    {company.name}
                                </h3>

                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                    {company.description || 'Chưa có mô tả'}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                    <span>{company.industry}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && companies.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">
                            business_center
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Không tìm thấy công ty nào
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center gap-2">
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
    )
}
