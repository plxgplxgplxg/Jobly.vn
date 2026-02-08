import { useState } from 'react'
import { JobType } from '../../../types/job.types'

export interface FilterOptions {
  location?: string
  jobType?: string[]
  salaryMin?: number
  salaryMax?: number
}

interface JobFiltersProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
}

const JOB_TYPES = [
  { value: JobType.FULL_TIME, label: 'Toàn thời gian' },
  { value: JobType.PART_TIME, label: 'Bán thời gian' },
  { value: JobType.CONTRACT, label: 'Hợp đồng' },
  { value: JobType.INTERNSHIP, label: 'Thực tập' },
]

const SALARY_RANGES = [
  { min: 0, max: 10000000, label: 'Dưới 10 triệu' },
  { min: 10000000, max: 20000000, label: '10 - 20 triệu' },
  { min: 20000000, max: 30000000, label: '20 - 30 triệu' },
  { min: 30000000, max: 50000000, label: '30 - 50 triệu' },
  { min: 50000000, max: undefined, label: 'Trên 50 triệu' },
]

export function JobFilters({ filters, onChange }: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleJobTypeChange = (type: string) => {
    const currentTypes = localFilters.jobType || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    setLocalFilters({ ...localFilters, jobType: newTypes })
  }

  const handleSalaryRangeChange = (min?: number, max?: number) => {
    setLocalFilters({ ...localFilters, salaryMin: min, salaryMax: max })
  }

  const handleLocationChange = (location: string) => {
    setLocalFilters({ ...localFilters, location })
  }

  const handleApply = () => {
    onChange(localFilters)
  }

  const handleReset = () => {
    const emptyFilters: FilterOptions = {
      location: '',
      jobType: [],
      salaryMin: undefined,
      salaryMax: undefined,
    }
    setLocalFilters(emptyFilters)
    onChange(emptyFilters)
  }

  const hasActiveFilters = 
    (localFilters.location && localFilters.location.length > 0) ||
    (localFilters.jobType && localFilters.jobType.length > 0) ||
    localFilters.salaryMin !== undefined ||
    localFilters.salaryMax !== undefined

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bộ lọc
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters content */}
      <div className={`p-4 space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Địa điểm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Địa điểm
          </label>
          <input
            type="text"
            value={localFilters.location || ''}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="Hà Nội, TP.HCM..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Loại hình công việc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Loại hình công việc
          </label>
          <div className="space-y-2">
            {JOB_TYPES.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.jobType?.includes(type.value) || false}
                  onChange={() => handleJobTypeChange(type.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Mức lương */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mức lương (VNĐ)
          </label>
          <div className="space-y-2">
            {SALARY_RANGES.map((range, index) => {
              const isSelected = 
                localFilters.salaryMin === range.min && 
                localFilters.salaryMax === range.max
              
              return (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="salary"
                    checked={isSelected}
                    onChange={() => handleSalaryRangeChange(range.min, range.max)}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {range.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Áp dụng
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Active filters count */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {[
              localFilters.location && 'Địa điểm',
              localFilters.jobType && localFilters.jobType.length > 0 && `${localFilters.jobType.length} loại hình`,
              (localFilters.salaryMin !== undefined || localFilters.salaryMax !== undefined) && 'Mức lương'
            ].filter(Boolean).join(', ')} đang được áp dụng
          </div>
        )}
      </div>
    </div>
  )
}
