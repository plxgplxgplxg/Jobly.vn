import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { companyService, type Company } from '../services/api/company.service'
import { jobService } from '../services/api/job.service'
import type { Job } from '../types/job.types'
import { API_BASE_URL } from '../constants/api'

export function HomePage() {
  const [topCompanies, setTopCompanies] = useState<Company[]>([])
  const [latestJobs, setLatestJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      setIsLoading(true)

      const [companiesRes, jobsRes] = await Promise.allSettled([
        companyService.getCompanies({ limit: 6 }),
        jobService.searchJobs({ page: 1, limit: 6 })
      ])

      if (companiesRes.status === 'fulfilled') {
        setTopCompanies(companiesRes.value.companies || [])
      } else {
        console.error('Error loading companies:', companiesRes.reason)
        setTopCompanies([])
      }

      if (jobsRes.status === 'fulfilled') {
        setLatestJobs(jobsRes.value.jobs || [])
      } else {
        console.error('Error loading jobs:', jobsRes.reason)
        setLatestJobs([])
      }
    } catch (error) {
      console.error('Error loading home data:', error)
      setTopCompanies([])
      setLatestJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (keyword.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(keyword.trim())}`)
    } else {
      navigate('/jobs')
    }
  }

  const formatSalary = (salary: any) => {
    if (typeof salary === 'string') return salary
    if (!salary || typeof salary !== 'object') return 'Thỏa thuận'

    const { min, max } = salary
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`
      return `${(num / 1000).toFixed(0)}K`
    }

    if (min === max) return `${formatNumber(min)} VNĐ`
    return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Tìm kiếm công việc <span className="text-primary">mơ ước</span> tại Jobly.vn
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Hàng ngàn cơ hội việc làm hấp dẫn từ các tập đoàn hàng đầu đang chờ đón bạn mỗi ngày.
          </p>

          {/* Search Container */}
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-sm py-4 outline-none"
                  placeholder="Tên công việc, kỹ năng..."
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full md:w-auto"
              >
                <span>Tìm kiếm</span>
              </Button>
            </form>
          </div>

          {/* Popular Tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-slate-500">Gợi ý phổ biến:</span>
            <Link to="/jobs?keyword=React" className="text-sm font-medium hover:text-primary transition-colors">
              React Native
            </Link>
            <Link to="/jobs?keyword=Designer" className="text-sm font-medium hover:text-primary transition-colors">
              UI/UX Designer
            </Link>
            <Link to="/jobs?keyword=Manager" className="text-sm font-medium hover:text-primary transition-colors">
              Project Manager
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20 bg-white dark:bg-[#1a1224]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Danh mục nghề nghiệp phổ biến</h2>
              <p className="text-slate-500">Khám phá hàng ngàn cơ hội theo từng lĩnh vực</p>
            </div>
            <Link to="/jobs" className="text-primary font-bold flex items-center gap-1 group">
              Xem tất cả
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'terminal', name: 'Công nghệ thông tin', count: '1,250', color: 'primary' },
              { icon: 'campaign', name: 'Marketing', count: '850', color: 'orange-500' },
              { icon: 'trending_up', name: 'Kinh doanh', count: '2,100', color: 'green-500' },
              { icon: 'account_balance', name: 'Tài chính', count: '600', color: 'blue-500' },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/jobs?category=${category.name}`}
                className="p-6 rounded-2xl bg-background-light dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 bg-${category.color}/10 rounded-xl flex items-center justify-center text-${category.color} mb-4`}>
                  <span className="material-symbols-outlined">{category.icon}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                <p className="text-slate-500 text-sm">{category.count} việc làm</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Employers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Nhà tuyển dụng hàng đầu</h2>
            <p className="text-slate-500">Các công ty uy tín đang tuyển dụng tại Jobly.vn</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topCompanies.map((company) => (
                <Link
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square flex items-center justify-center">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl.startsWith('http') ? company.logoUrl : `${API_BASE_URL}${company.logoUrl}`}
                        alt={company.name}
                        className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <span className="material-symbols-outlined text-slate-400 text-4xl">business</span>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm font-medium mt-3 text-slate-700 dark:text-slate-300 line-clamp-1">
                    {company.name}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && topCompanies.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Chưa có công ty nào
            </div>
          )}
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-20 bg-white dark:bg-[#1a1224]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Việc làm mới nhất</h2>
              <p className="text-slate-500">Cập nhật liên tục các cơ hội việc làm hấp dẫn</p>
            </div>
            <Link to="/jobs" className="text-primary font-bold flex items-center gap-1 group">
              Xem tất cả
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-primary/50 hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="size-14 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      {job.company?.logoUrl ? (
                        <img
                          src={job.company.logoUrl.startsWith('http') ? job.company.logoUrl : `${API_BASE_URL}${job.company.logoUrl}`}
                          alt={job.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-2xl">business</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {job.company?.name || 'Công ty'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">payments</span>
                        <span className="font-medium text-primary">{formatSalary(job.salary)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <Link to={`/jobs/${job.id}`}>
                    <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 font-bold text-sm transition-all">
                      Ứng tuyển ngay
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!isLoading && latestJobs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Chưa có việc làm nào
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Bạn đang muốn tuyển dụng nhân tài?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Đăng tin tuyển dụng và tìm kiếm ứng viên chất lượng nhất Việt Nam ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth/register">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                Đăng tin tuyển dụng
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Tìm việc ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
