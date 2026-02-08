import { useState, useEffect } from 'react'
import { cvTemplateService, type CVTemplate } from '../../../services/api/cvTemplate.service'

interface CVTemplateSelectorProps {
  onSelect: (template: CVTemplate) => void
}

export function CVTemplateSelector({ onSelect }: CVTemplateSelectorProps) {
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await cvTemplateService.getTemplates()
      setTemplates(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (template: CVTemplate) => {
    setSelectedId(template.id)
    onSelect(template)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadTemplates}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Chưa có template nào. Vui lòng liên hệ admin để thêm template.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Chọn Template CV
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Chọn một template phù hợp để tạo CV chuyên nghiệp của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`
              relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
              transition-all duration-200 cursor-pointer
              ${selectedId === template.id
                ? 'ring-2 ring-blue-600 shadow-lg'
                : 'hover:shadow-lg hover:scale-105'
              }
            `}
            onClick={() => handleSelect(template)}
          >
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {template.previewImageUrl ? (
                <img
                  src={template.previewImageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {template.description}
              </p>
            </div>

            {/* Selected indicator */}
            {selectedId === template.id && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Select button overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-lg transform hover:scale-105 transition-transform">
                Chọn template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
