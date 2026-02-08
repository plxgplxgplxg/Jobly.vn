import { useState } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'

interface JobSearchBarProps {
  onSearch: (keyword: string) => void
  initialValue?: string
}

export function JobSearchBar({ onSearch, initialValue = '' }: JobSearchBarProps) {
  const [keyword, setKeyword] = useState(initialValue)
  const debouncedKeyword = useDebounce(keyword, 300)

  // Trigger search khi debounced value thay đổi
  useState(() => {
    if (debouncedKeyword !== initialValue) {
      onSearch(debouncedKeyword)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(keyword)
  }

  const handleClear = () => {
    setKeyword('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm công việc theo từ khóa, vị trí, công ty..."
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-2">
          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </form>
  )
}
