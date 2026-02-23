import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { userService } from '../../services/api/user.service'
import { useUIStore } from '../../store/uiStore'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { API_BASE_URL } from '../../constants/api'

export function EmployerProfilePage() {
    const { user, setUser } = useAuthStore()
    const { addNotification } = useUIStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        taxCode: '',
        industry: '',
        address: '',
        website: '',
        description: '',
        logoUrl: ''
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                name: (user as any).name || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                companyName: user.company?.name || '',
                taxCode: user.company?.taxCode || '',
                industry: user.company?.industry || '',
                address: user.company?.address || '',
                website: user.company?.website || '',
                description: user.company?.description || '',
                logoUrl: user.company?.logoUrl || ''
            })
        }
    }, [user])

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user?.company?.id) return

        try {
            setIsLoading(true)
            const { logoUrl } = await userService.uploadLogo(user.company.id, file)

            // Update local state and auth store
            setProfileData(prev => ({ ...prev, logoUrl }))
            if (user && user.company) {
                setUser({
                    ...user,
                    company: {
                        ...user.company,
                        logoUrl
                    }
                })
            }

            addNotification({
                type: 'success',
                message: 'Cập nhật logo thành công'
            })
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Không thể tải logo lên'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.company?.id) return

        try {
            setIsUpdating(true)
            const updateData = {
                name: profileData.companyName,
                taxCode: profileData.taxCode,
                industry: profileData.industry,
                address: profileData.address,
                website: profileData.website,
                description: profileData.description
            }

            await userService.updateCompany(user.company.id, updateData)

            // Update auth store
            if (user && user.company) {
                setUser({
                    ...user,
                    company: {
                        ...user.company,
                        ...updateData
                    }
                })
            }

            addNotification({
                type: 'success',
                message: 'Cập nhật thông tin công ty thành công'
            })
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Cập nhật thất bại'
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Thông tin công ty</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Quản lý hồ sơ doanh nghiệp của bạn</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General Info & Logo */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <div className="relative inline-block group mb-4">
                            <div className="size-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                {profileData.logoUrl ? (
                                    <img
                                        src={profileData.logoUrl.startsWith('http') ? profileData.logoUrl : `${API_BASE_URL}${profileData.logoUrl}`}
                                        alt="Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-slate-400">business</span>
                                )}
                            </div>
                            <label className="absolute bottom-2 right-2 size-8 bg-primary text-white rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-sm">edit</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isLoading} />
                            </label>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profileData.companyName}</h2>
                        <p className="text-sm text-slate-500">{profileData.industry}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Thông tin tài khoản</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Người đại diện</p>
                                <p className="text-sm font-medium mt-1">{profileData.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email đăng nhập</p>
                                <p className="text-sm font-medium mt-1">{profileData.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Update Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleUpdateCompany} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Tên công ty"
                                value={profileData.companyName}
                                onChange={e => setProfileData({ ...profileData, companyName: e.target.value })}
                                required
                            />
                            <Input
                                label="Mã số thuế"
                                value={profileData.taxCode}
                                onChange={e => setProfileData({ ...profileData, taxCode: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Lĩnh vực"
                                value={profileData.industry}
                                onChange={e => setProfileData({ ...profileData, industry: e.target.value })}
                            />
                            <Input
                                label="Website"
                                value={profileData.website}
                                onChange={e => setProfileData({ ...profileData, website: e.target.value })}
                                placeholder="https://"
                            />
                        </div>

                        <Input
                            label="Địa chỉ trụ sở"
                            value={profileData.address}
                            onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả công ty</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 min-h-[150px] transition-all"
                                value={profileData.description}
                                onChange={e => setProfileData({ ...profileData, description: e.target.value })}
                                placeholder="Giới thiệu về công ty của bạn..."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isUpdating} variant="primary" className="px-8">
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
