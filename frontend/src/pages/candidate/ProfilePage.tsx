import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/common/Button'

export function ProfilePage() {
  const { user } = useAuthStore()

  const getExperienceLabel = (value: string) => {
    const map: Record<string, string> = {
      no_experience: 'Chưa có kinh nghiệm',
      under_1_year: 'Dưới 1 năm',
      '1_2_years': '1-2 năm',
      '3_5_years': '3-5 năm',
      '5_10_years': '5-10 năm',
      over_10_years: 'Trên 10 năm'
    }
    return map[value] || value
  }

  const getJobLevelLabel = (value: string) => {
    const map: Record<string, string> = {
      intern: 'Thực tập sinh',
      fresher: 'Fresher',
      junior: 'Junior',
      middle: 'Middle',
      senior: 'Senior',
      leader: 'Trưởng nhóm',
      manager: 'Quản lý',
      director: 'Giám đốc'
    }
    return map[value] || value
  }

  const getWorkTypeLabel = (value: string) => {
    const map: Record<string, string> = {
      full_time: 'Toàn thời gian',
      part_time: 'Bán thời gian',
      freelance: 'Freelance',
      internship: 'Thực tập',
      contract: 'Hợp đồng'
    }
    return map[value] || value
  }

  const getSalaryLabel = (value: string) => {
    const map: Record<string, string> = {
      negotiable: 'Thỏa thuận',
      under_10: 'Dưới 10 triệu',
      '10_15': '10-15 triệu',
      '15_20': '15-20 triệu',
      '20_30': '20-30 triệu',
      '30_50': '30-50 triệu',
      over_50: 'Trên 50 triệu'
    }
    return map[value] || value
  }

  const profileSections = [
    {
      title: 'Thông tin cá nhân',
      icon: 'person',
      items: [
        { label: 'Họ và tên', value: (user as any)?.name || 'Chưa cập nhật' },
        { label: 'Email', value: user?.email || 'Chưa cập nhật' },
        { label: 'Số điện thoại', value: (user as any)?.phone || 'Chưa cập nhật' },
        { label: 'Ngày sinh', value: (user as any)?.dateOfBirth ? new Date((user as any).dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật' },
        { label: 'Giới tính', value: (user as any)?.gender === 'male' ? 'Nam' : (user as any)?.gender === 'female' ? 'Nữ' : (user as any)?.gender === 'other' ? 'Khác' : 'Chưa cập nhật' },
      ]
    },
    {
      title: 'Thông tin nghề nghiệp',
      icon: 'work',
      items: [
        { label: 'Vị trí mong muốn', value: (user as any)?.desiredPosition || 'Chưa cập nhật' },
        { label: 'Kinh nghiệm', value: (user as any)?.experienceLevel ? getExperienceLabel((user as any).experienceLevel) : 'Chưa cập nhật' },
        { label: 'Cấp bậc', value: (user as any)?.jobLevel ? getJobLevelLabel((user as any).jobLevel) : 'Chưa cập nhật' },
        { label: 'Hình thức làm việc', value: (user as any)?.workType ? getWorkTypeLabel((user as any).workType) : 'Chưa cập nhật' },
        { label: 'Mức lương mong muốn', value: (user as any)?.expectedSalary ? getSalaryLabel((user as any).expectedSalary) : 'Chưa cập nhật' },
      ]
    },
    {
      title: 'Địa điểm làm việc',
      icon: 'location_on',
      items: [
        { label: 'Ngành nghề', value: (user as any)?.industry || 'Chưa cập nhật' },
        { label: 'Tỉnh/Thành phố', value: (user as any)?.province || 'Chưa cập nhật' },
        { label: 'Sẵn sàng di chuyển', value: (user as any)?.willingToRelocate ? 'Có' : 'Không' },
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Hồ sơ của tôi
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>
        <Link to="/candidate/profile-completion">
          <Button variant="primary">
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>Chỉnh sửa</span>
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white shadow-lg shadow-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden flex items-center justify-center text-4xl font-bold border-2 border-white/50 shadow-inner">
            {(user as any)?.avatarUrl ? (
              <img
                src={(user as any).avatarUrl.startsWith('http') ? (user as any).avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${(user as any).avatarUrl}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (user as any)?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">{(user as any)?.name}</h2>
            <p className="text-white/80 mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                {(user as any)?.desiredPosition || 'Chưa cập nhật vị trí'}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                {(user as any)?.experienceLevel ? getExperienceLabel((user as any).experienceLevel) : 'Chưa cập nhật kinh nghiệm'}
              </span>
            </div>
          </div>
          <div className="text-center md:text-right bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-white/80 text-xs mb-1 uppercase tracking-wider">Độ hoàn thiện hồ sơ</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: (user as any)?.profileCompleted ? '100%' : '50%' }}
                ></div>
              </div>
              <span className="font-bold">{(user as any)?.profileCompleted ? '100%' : '50%'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profileSections.map((section) => (
          <div
            key={section.title}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">{section.icon}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {section.title}
              </h2>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex justify-between items-start">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CV Management */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">description</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              CV của tôi
            </h2>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">insert_drive_file</span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">CV_Frontend_Developer.pdf</p>
                  <p className="text-xs text-slate-500">Tải lên 2 ngày trước</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium">
                Mặc định
              </span>
            </div>
            <Link
              to="/candidate/cv-management"
              className="block text-center py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors"
            >
              + Quản lý CV
            </Link>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">settings</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Cài đặt tài khoản
            </h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Đổi mật khẩu</span>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Cài đặt thông báo</span>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Quyền riêng tư</span>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400">
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
