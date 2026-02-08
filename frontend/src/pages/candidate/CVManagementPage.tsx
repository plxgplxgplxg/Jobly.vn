import { useState, useEffect } from 'react'
import { CVUpload } from '../../components/features/cv/CVUpload'
import { CVList } from '../../components/features/cv/CVList'
import { userService, type CV } from '../../services/api/user.service'
import { useUIStore } from '../../store/uiStore'

export function CVManagementPage() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const { addNotification } = useUIStore()

  useEffect(() => {
    loadCVs()
  }, [])

  const loadCVs = async () => {
    try {
      setIsLoading(true)
      const data = await userService.getMyCVs()
      setCvs(data)
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải danh sách CV'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const newCV = await userService.uploadCV(file)
      setCvs([newCV, ...cvs])
      
      addNotification({
        type: 'success',
        message: 'Tải lên CV thành công!'
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Tải lên CV thất bại'
      })
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteCV(id)
      setCvs(cvs.filter(cv => cv.id !== id))
      
      addNotification({
        type: 'success',
        message: 'Xóa CV thành công!'
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Xóa CV thất bại'
      })
      throw error
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await userService.setDefaultCV(id)
      setCvs(cvs.map(cv => ({
        ...cv,
        isDefault: cv.id === id
      })))
      
      addNotification({
        type: 'success',
        message: 'Đã đặt CV mặc định!'
      })
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể đặt CV mặc định'
      })
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý CV
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Tải lên và quản lý CV của bạn
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Tải lên CV mới
            </h2>
            <CVUpload onUpload={handleUpload} isUploading={isUploading} />
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              CV đã tải lên ({cvs.length})
            </h2>
            <CVList 
              cvs={cvs} 
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
