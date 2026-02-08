import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { userService } from '../../services/api/user.service'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

interface ProfileCompletionForm {
    name: string
    phone: string
    address: string
    desiredPosition: string
    experienceLevel: string
    jobLevel: string
    workType: string
    gender: string
    expectedSalary: string
    industry: string
    province: string
    district?: string
    ward?: string
    willingToRelocate: boolean
    dateOfBirth?: string
}

export function ProfileCompletionPage() {
    const navigate = useNavigate()
    const { addNotification } = useUIStore()
    const { setUser } = useAuthStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileCompletionForm>()

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await userService.getProfile()
                reset({
                    name: profile.name || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                    desiredPosition: profile.desiredPosition || '',
                    experienceLevel: profile.experienceLevel || '',
                    jobLevel: profile.jobLevel || '',
                    workType: profile.workType || '',
                    gender: profile.gender || '',
                    expectedSalary: profile.expectedSalary || '',
                    industry: profile.industry || '',
                    province: profile.province || '',
                    willingToRelocate: profile.willingToRelocate || false,
                    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''
                })
                if (profile.avatarUrl) {
                    setAvatarUrl(profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${profile.avatarUrl}`)
                }
            } catch (error) {
                console.error('Lỗi khi tải thông tin:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadProfile()
    }, [reset])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (data: ProfileCompletionForm) => {
        try {
            setIsSubmitting(true)

            // 1. Upload avatar if changed
            if (avatarFile) {
                await userService.uploadAvatar(avatarFile)
            }

            // 2. Complete profile
            const updatedProfile = await userService.completeProfile(data)

            // 3. Update auth store
            setUser(updatedProfile as any)

            addNotification({
                type: 'success',
                message: 'Cập nhật hồ sơ thành công!'
            })

            navigate('/candidate/profile')
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.error || error.message || 'Có lỗi xảy ra'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Cập nhật hồ sơ
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Điền đầy đủ thông tin để nhà tuyển dụng dễ dàng tìm thấy bạn
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-5xl">person</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <p className="text-sm text-slate-500 mt-3 italic text-center">
                                Ảnh chân dung giúp nhà tuyển dụng nhận diện bạn tốt hơn
                            </p>
                        </div>

                        {/* Basic Info Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                {...register('name', { required: 'Họ và tên là bắt buộc' })}
                                label="Họ và tên"
                                placeholder="VD: Nguyễn Văn A"
                                error={errors.name?.message}
                                required
                            />
                            <Input
                                {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                                label="Số điện thoại"
                                placeholder="0123456789"
                                error={errors.phone?.message}
                                required
                            />
                        </div>

                        <Input
                            {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                            label="Địa chỉ"
                            placeholder="VD: Số 123, đường ABC, phường XYZ..."
                            error={errors.address?.message}
                            required
                        />

                        {/* Vị trí mong muốn */}
                        <Input
                            {...register('desiredPosition', { required: 'Vị trí mong muốn là bắt buộc' })}
                            label="Vị trí mong muốn"
                            placeholder="VD: Nhân viên kinh doanh, Nhân viên hành chính..."
                            error={errors.desiredPosition?.message}
                            required
                        />

                        {/* Row 1: Ngày sinh + Giới tính */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                {...register('dateOfBirth')}
                                type="date"
                                label="Ngày sinh"
                                error={errors.dateOfBirth?.message}
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Giới tính <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('gender', { required: 'Vui lòng chọn giới tính' })}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">-- Chọn giới tính --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Kinh nghiệm + Cấp bậc */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Kinh nghiệm <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('experienceLevel', { required: 'Vui lòng chọn kinh nghiệm' })}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">-- Chọn kinh nghiệm --</option>
                                    <option value="no_experience">Chưa có kinh nghiệm</option>
                                    <option value="under_1_year">Dưới 1 năm</option>
                                    <option value="1_2_years">1-2 năm</option>
                                    <option value="3_5_years">3-5 năm</option>
                                    <option value="5_10_years">5-10 năm</option>
                                    <option value="over_10_years">Trên 10 năm</option>
                                </select>
                                {errors.experienceLevel && (
                                    <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Cấp bậc hiện tại <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('jobLevel', { required: 'Vui lòng chọn cấp bậc' })}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">-- Chọn cấp bậc --</option>
                                    <option value="intern">Thực tập sinh</option>
                                    <option value="fresher">Fresher</option>
                                    <option value="junior">Junior</option>
                                    <option value="middle">Middle</option>
                                    <option value="senior">Senior</option>
                                    <option value="leader">Trưởng nhóm</option>
                                    <option value="manager">Quản lý</option>
                                    <option value="director">Giám đốc</option>
                                </select>
                                {errors.jobLevel && (
                                    <p className="mt-1 text-sm text-red-600">{errors.jobLevel.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 3: Hình thức + Mức lương */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Hình thức làm việc <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('workType', { required: 'Vui lòng chọn hình thức' })}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">-- Chọn hình thức --</option>
                                    <option value="full_time">Toàn thời gian</option>
                                    <option value="part_time">Bán thời gian</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="internship">Thực tập</option>
                                    <option value="contract">Hợp đồng</option>
                                </select>
                                {errors.workType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.workType.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Mức lương mong muốn <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('expectedSalary', { required: 'Vui lòng chọn mức lương' })}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">-- Chọn mức lương --</option>
                                    <option value="negotiable">Thỏa thuận</option>
                                    <option value="under_10">Dưới 10 triệu</option>
                                    <option value="10_15">10-15 triệu</option>
                                    <option value="15_20">15-20 triệu</option>
                                    <option value="20_30">20-30 triệu</option>
                                    <option value="30_50">30-50 triệu</option>
                                    <option value="over_50">Trên 50 triệu</option>
                                </select>
                                {errors.expectedSalary && (
                                    <p className="mt-1 text-sm text-red-600">{errors.expectedSalary.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 4: Ngành nghề + Tỉnh thành */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Ngành nghề <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('industry', { required: 'Vui lòng chọn ngành nghề' })}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">Chọn ngành nghề</option>
                                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                                    <option value="Kinh doanh">Kinh doanh</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Tài chính">Tài chính</option>
                                    <option value="Nhân sự">Nhân sự</option>
                                    <option value="Hành chính">Hành chính</option>
                                    <option value="Kế toán">Kế toán</option>
                                    <option value="Khác">Khác</option>
                                </select>
                                {errors.industry && (
                                    <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tỉnh thành làm việc <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('province', { required: 'Vui lòng chọn tỉnh thành' })}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white transition-all outline-none"
                                >
                                    <option value="">Chọn tỉnh thành</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    <option value="Hải Phòng">Hải Phòng</option>
                                    <option value="Cần Thơ">Cần Thơ</option>
                                </select>
                                {errors.province && (
                                    <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Relocate Checkbox */}
                        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <input
                                type="checkbox"
                                {...register('willingToRelocate')}
                                className="w-5 h-5 mt-0.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                            />
                            <div className="flex-1">
                                <label className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                                    Sẵn sàng thay đổi địa điểm làm việc
                                </label>
                                <p className="text-xs text-slate-500 mt-1">
                                    Tích chọn nếu bạn có thể di chuyển sang tỉnh thành khác để làm việc nếu có cơ hội phù hợp
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/candidate/profile')}
                                className="flex-1 py-3"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                                className="flex-1 py-3 shadow-lg shadow-primary/20"
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
