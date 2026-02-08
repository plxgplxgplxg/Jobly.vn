import { Link } from 'react-router-dom'
import type { Job } from '../../../types/job.types'

interface JobCardProps {
  job: Job
  variant?: 'list' | 'grid'
  onApply?: (jobId: string) => void
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  contract: 'Hợp đồng',
  internship: 'Thực tập',
}

export function JobCard({ job, variant = 'grid', onApply }: JobCardProps) {
  const formatSalary = (salary: any) => {
    if (typeof salary === 'string') return salary

    if (!salary || typeof salary !== 'object') return 'Thỏa thuận'

    const { min, max } = salary
    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(0)} triệu`
      }
      return `${(num / 1000).toFixed(0)}K`
    }

    if (min === max) {
      return `${formatNumber(min)} VNĐ`
    }
    return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
    return date.toLocaleDateString('vi-VN')
  }

  if (variant === 'list') {
    return (
      <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-primary/50 hover:shadow-xl transition-all">
        <div className="flex items-start justify-between gap-4">
          {/* Company logo */}
          <div className="flex-shrink-0">
            {job.company?.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-3xl">business</span>
              </div>
            )}
          </div>

          {/* Job info */}
          <div className="flex-1 min-w-0">
            <Link
              to={`/jobs/${job.id}`}
              className="block group"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {job.company?.name || 'Công ty ẩn danh'}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">location_on</span>
                {job.location}
              </div>

              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">payments</span>
                <span className="font-medium text-primary">{formatSalary(job.salary)}</span>
              </div>

              {job.type && JOB_TYPE_LABELS[job.type] && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {JOB_TYPE_LABELS[job.type]}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {job.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <span className="text-xs text-slate-400">
              {formatDate(job.createdAt)}
            </span>

            {onApply && (
              <button
                onClick={() => onApply(job.id)}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 font-bold text-sm whitespace-nowrap transition-all"
              >
                Ứng tuyển
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Grid variant
  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden">
      {/* Company logo header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400 text-2xl">business</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {job.company?.name || 'Công ty ẩn danh'}
            </p>
            <p className="text-xs text-slate-400">
              {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Job content */}
      <Link to={`/jobs/${job.id}`} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {job.title}
        </h3>

        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base flex-shrink-0">location_on</span>
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base flex-shrink-0">payments</span>
            <span className="font-medium text-primary">
              {formatSalary(job.salary)}
            </span>
          </div>
        </div>

        {job.type && JOB_TYPE_LABELS[job.type] && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {JOB_TYPE_LABELS[job.type]}
          </span>
        )}
      </Link>

      {/* Footer */}
      {onApply && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onApply(job.id)}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 font-bold text-sm transition-all"
          >
            Ứng tuyển ngay
          </button>
        </div>
      )}
    </div>
  )
}
