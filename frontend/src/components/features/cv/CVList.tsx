import { useState } from 'react'
import type { CV } from '../../../services/api/user.service'
import { CVPreviewModal } from '../../common/CVPreviewModal'
import { API_BASE_URL } from '../../../constants/api'

interface CVListProps {
  cvs: CV[]
  onDelete: (id: string) => Promise<void>
  onSetDefault?: (id: string) => Promise<void>
}

export function CVList({ cvs, onDelete, onSetDefault }: CVListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const [previewCV, setPreviewCV] = useState<CV | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await onDelete(id)
      setShowConfirm(null)
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  if (cvs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Chưa có CV nào
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tải lên CV của bạn để bắt đầu ứng tuyển
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {cvs.map((cv) => (
          <div
            key={cv.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0">
                  <svg
                    className="h-10 w-10 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {cv.fileName}
                    </h3>
                    {cv.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatFileSize(cv.fileSize)} • Tải lên {formatDate(cv.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setPreviewCV(cv)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Xem CV"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <a
                  href={cv.fileUrl.startsWith('http') ? cv.fileUrl : `${API_BASE_URL}${cv.fileUrl}`}
                  download
                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                  title="Tải xuống"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>

                {!cv.isDefault && onSetDefault && (
                  <button
                    onClick={() => onSetDefault(cv.id)}
                    className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                    title="Đặt làm mặc định"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={() => setShowConfirm(cv.id)}
                  disabled={deletingId === cv.id}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                  title="Xóa"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm dialog */}
            {showConfirm === cv.id && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Bạn có chắc chắn muốn xóa CV này?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleDelete(cv.id)}
                    disabled={deletingId === cv.id}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === cv.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {previewCV && (
        <CVPreviewModal
          url={previewCV.fileUrl.startsWith('http') ? previewCV.fileUrl : `${API_BASE_URL}${previewCV.fileUrl}`}
          fileName={previewCV.fileName}
          isOpen={true}
          onClose={() => setPreviewCV(null)}
        />
      )}
    </>
  )
}
