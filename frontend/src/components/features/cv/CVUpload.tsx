import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { useUIStore } from '../../../store/uiStore'

interface CVUploadProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']

export function CVUpload({ onUpload, isUploading = false }: CVUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addNotification } = useUIStore()

  const validateFile = (file: File): boolean => {
    // Kiểm tra loại file
    if (!ALLOWED_TYPES.includes(file.type)) {
      addNotification({
        type: 'error',
        message: 'Chỉ chấp nhận file PDF, DOCX hoặc ảnh (JPG, PNG)'
      })
      return false
    }

    // Kiểm tra kích thước
    if (file.size > MAX_FILE_SIZE) {
      addNotification({
        type: 'error',
        message: 'File không được vượt quá 5MB'
      })
      return false
    }

    return true
  }

  const handleFileSelect = async (file: File) => {
    if (validateFile(file)) {
      try {
        await onUpload(file)
      } catch (error) {
        // Error được xử lý ở component cha
      }
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input để có thể upload lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isUploading ? (
              <span className="font-medium text-blue-600">Đang tải lên...</span>
            ) : (
              <>
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click để chọn file
                </span>
                {' '}hoặc kéo thả file vào đây
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            PDF, DOCX, JPG, PNG tối đa 5MB
          </p>
        </div>
      </div>
    </div>
  )
}
