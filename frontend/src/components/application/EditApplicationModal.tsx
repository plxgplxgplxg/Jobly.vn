import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { userService } from '../../services/api/user.service'
import { applicationService } from '../../services/api/application.service'
import type { Application } from '../../types/api.types'
import type { CV } from '../../types/user.types'
import { useUIStore } from '../../store/uiStore'

interface EditApplicationModalProps {
    application: Application
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

interface UpdateForm {
    cvId: string;
    coverLetter: string;
}

export function EditApplicationModal({ application, isOpen, onClose, onSuccess }: EditApplicationModalProps) {
    const { addNotification } = useUIStore()
    const [cvList, setCvList] = useState<CV[]>([])
    const [isLoadingCVs, setIsLoadingCVs] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<UpdateForm>({
        defaultValues: {
            cvId: application.cvId,
            coverLetter: application.coverLetter || ''
        }
    })

    useEffect(() => {
        if (isOpen) {
            loadCVs()
        }
    }, [isOpen])

    const loadCVs = async () => {
        try {
            setIsLoadingCVs(true)
            const data = await userService.getMyCVs()
            setCvList(data)
        } catch (error) {
            console.error('Failed to load CVs', error)
            addNotification({
                type: 'error',
                message: 'Không thể tải danh sách CV của bạn'
            })
        } finally {
            setIsLoadingCVs(false)
        }
    }

    const onSubmit = async (data: UpdateForm) => {
        try {
            setIsSubmitting(true)
            await applicationService.updateApplication(application.id, {
                cvId: data.cvId,
                cvType: 'uploaded', // Hiện tại chỉ support uploaded CV updates
                coverLetter: data.coverLetter
            })

            addNotification({
                type: 'success',
                message: 'Cập nhật hồ sơ thành công! Đơn ứng tuyển đã được gửi lại.'
            })
            onSuccess()
            onClose()
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cập nhật hồ sơ ứng tuyển</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                        <span className="material-symbols-outlined mr-2 text-sm mt-0.5">info</span>
                        Lưu ý: Khi cập nhật, trạng thái đơn ứng tuyển sẽ được đặt lại thành "Đã nộp" để nhà tuyển dụng xét duyệt lại.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Chọn CV mới <span className="text-red-500">*</span>
                        </label>

                        {isLoadingCVs ? (
                            <div className="text-gray-500 text-sm flex items-center">
                                <span className="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
                                Đang tải danh sách CV...
                            </div>
                        ) : cvList.length > 0 ? (
                            <select
                                {...register('cvId', { required: 'Vui lòng chọn CV' })}
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg"
                            >
                                <option value="">-- Chọn CV --</option>
                                {cvList.map(cv => (
                                    <option key={cv.id} value={cv.id}>
                                        {cv.fileName} {cv.isDefault ? '(Mặc định)' : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-red-600 text-sm">
                                Bạn chưa có CV nào upload. Vui lòng tải CV lên trước.
                            </div>
                        )}
                        {errors.cvId && (
                            <p className="mt-1 text-sm text-red-600">{errors.cvId.message}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Thư giới thiệu (Cover Letter)
                        </label>
                        <textarea
                            {...register('coverLetter')}
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm py-3 px-4 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Cập nhật thư giới thiệu..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-primary/30 flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
                                    Đang cập nhật...
                                </>
                            ) : (
                                'Cập nhật'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
