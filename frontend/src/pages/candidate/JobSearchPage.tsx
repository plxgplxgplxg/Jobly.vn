import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { JobSearchBar } from '../../components/features/jobs/JobSearchBar'
import { JobFilters, type FilterOptions } from '../../components/features/jobs/JobFilters'
import { JobCard } from '../../components/features/jobs/JobCard'
import { jobService } from '../../services/api/job.service'
import type { Job, SearchQuery } from '../../types/job.types'
import { useUIStore } from '../../store/uiStore'

export function JobSearchPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addNotification } = useUIStore()

  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [filters, setFilters] = useState<FilterOptions>({
    location: searchParams.get('location') || '',
    jobType: searchParams.getAll('jobType'),
    salaryMin: searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined,
    salaryMax: searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined,
  })

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')

  useEffect(() => {
    searchJobs()
  }, [keyword, filters, currentPage])

  const searchJobs = async () => {
    try {
      setIsLoading(true)

      const query: SearchQuery = {
        keyword: keyword || undefined,
        location: filters.location || undefined,
        jobType: filters.jobType && filters.jobType.length > 0 ? filters.jobType as any : undefined,
        salaryMin: filters.salaryMin,
        salaryMax: filters.salaryMax,
        page: currentPage,
        limit: 12,
      }

      const response = await jobService.searchJobs(query)
      setJobs(response.jobs)
      setTotalPages(response.pagination.totalPages)

      // Update URL params
      const params = new URLSearchParams()
      if (keyword) params.set('keyword', keyword)
      if (filters.location) params.set('location', filters.location)
      if (filters.jobType) filters.jobType.forEach(type => params.append('jobType', type))
      if (filters.salaryMin) params.set('salaryMin', filters.salaryMin.toString())
      if (filters.salaryMax) params.set('salaryMax', filters.salaryMax.toString())
      if (currentPage > 1) params.set('page', currentPage.toString())
      setSearchParams(params)

    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tìm kiếm công việc'
      })
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword)
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleApply = (jobId: string) => {
    navigate(`/jobs/${jobId}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Tìm kiếm việc làm
          </h1>
          <JobSearchBar onSearch={handleSearch} initialValue={keyword} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <JobFilters filters={filters} onChange={handleFilterChange} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-slate-600 dark:text-slate-400">
                {isLoading ? (
                  'Đang tìm kiếm...'
                ) : (
                  <>
                    Tìm thấy <span className="font-semibold text-slate-900 dark:text-slate-100">{jobs.length}</span> công việc
                  </>
                )}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  aria-label="Xem dạng lưới"
                >
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  aria-label="Xem dạng danh sách"
                >
                  <span className="material-symbols-outlined text-xl">view_list</span>
                </button>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && jobs.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined mx-auto text-slate-400 text-6xl">search_off</span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                  Không tìm thấy công việc
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm
                </p>
              </div>
            )}

            {/* Jobs grid/list */}
            {!isLoading && jobs.length > 0 && (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      variant={viewMode}
                      onApply={handleApply}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all"
                      >
                        Trước
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${page === currentPage
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 text-slate-400">...</span>
                        }
                        return null
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all"
                      >
                        Sau
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
