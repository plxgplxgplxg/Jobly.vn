import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/common/Button'
import { userService } from '../../services/api/user.service'
import { useUIStore } from '../../store/uiStore'

export function EmployerProfilePage() {
    const { user, setUser } = useAuthStore()
    const { addNotification } = useUIStore()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        companyName: '',
        taxCode: '',
        industry: '',
        description: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: (user as any).name || '',
                phone: (user as any).phone || '',
                address: (user as any).address || '',
                companyName: (user as any).company?.name || '',
                taxCode: (user as any).company?.taxCode || '',
                industry: (user as any).company?.industry || '',
                description: (user as any).company?.description || ''
            })
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            // Update User Profile
            await userService.updateProfile({
                name: formData.name,
                phone: formData.phone,
                address: formData.address
            })

            // Update Company Profile if exists, else create
            // ... (keep logic)
            if ((user as any).company?.id) {
                await userService.updateCompany((user as any).company.id, {
                    name: formData.companyName,
                    taxCode: formData.taxCode,
                    industry: formData.industry,
                    description: formData.description
                })
            } else {
                await userService.createCompany({
                    name: formData.companyName,
                    taxCode: formData.taxCode,
                    industry: formData.industry,
                    description: formData.description
                })
            }

            // Refresh user data (simplified)
            const freshProfile = await userService.getProfile()
            setUser(freshProfile as any)

            addNotification({
                type: 'success',
                message: 'Cập nhật thông tin thành công'
            })
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.error || 'Không thể cập nhật thông tin'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 py-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Thông tin nhà tuyển dụng
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Quản lý thông tin cá nhân và doanh nghiệp của bạn
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Thông tin cá nhân
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Địa chí
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập địa chỉ"
                            />
                        </div>
                    </div>
                </div>

                {/* Company Info Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">business</span>
                        Thông tin công ty
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tên công ty
                            </label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập tên công ty đầy đủ"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Mã số thuế
                            </label>
                            <input
                                type="text"
                                value={formData.taxCode}
                                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập mã số thuế (10 hoặc 13 số)"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Lĩnh vực hoạt động
                            </label>
                            <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Ví dụ: Công nghệ thông tin, Xây dựng..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Giới thiệu công ty
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[150px]"
                                placeholder="Mô tả về công ty, quy mô, văn hóa..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" variant="primary" isLoading={isLoading} className="px-10">
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </div>
    )
}
