import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { API_BASE_URL } from '../constants/api'
import { FloatingChat } from '../components/features/messages/FloatingChat'
import { NotificationBell } from '../components/common/NotificationBell'

export function MainLayout() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1f1629] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Main Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-white">work</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-primary">Jobly.vn</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                {user?.role === UserRole.EMPLOYER ? (
                  <>
                    <Link to="/employer/jobs" className="text-sm font-semibold hover:text-primary transition-colors">
                      Quản lý tin
                    </Link>
                    <Link to="/employer/candidates" className="text-sm font-semibold hover:text-primary transition-colors">
                      Tìm ứng viên
                    </Link>
                    <Link to="/employer/jobs/new" className="text-sm font-semibold hover:text-primary transition-colors text-primary border border-primary/20 bg-primary/5 px-3 py-1 rounded-md">
                      Đăng tin
                    </Link>
                  </>
                ) : user?.role === UserRole.ADMIN ? (
                  <Link to="/admin/dashboard" className="text-sm font-semibold hover:text-primary transition-colors">
                    Trang quản trị
                  </Link>
                ) : (
                  <>
                    <Link to="/jobs" className="text-sm font-semibold hover:text-primary transition-colors">
                      Tìm việc
                    </Link>
                    <Link to="/companies" className="text-sm font-semibold hover:text-primary transition-colors">
                      Công ty
                    </Link>
                    <Link to="/cv-builder" className="text-sm font-semibold hover:text-primary transition-colors">
                      Tạo CV
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                <span className="material-symbols-outlined text-xl">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {isAuthenticated && <NotificationBell />}

              {isAuthenticated ? (
                <div className="relative group">
                  <div className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-bold text-sm">
                      {user?.role === UserRole.EMPLOYER && user.company?.logoUrl ? (
                        <img
                          src={user.company.logoUrl.startsWith('http') ? user.company.logoUrl : `${API_BASE_URL}${user.company.logoUrl}`}
                          alt={user.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0)
                      )}
                    </div>
                    <span className="text-sm font-semibold hidden sm:block">
                      {user?.name}
                    </span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      {user?.role === UserRole.EMPLOYER ? (
                        <>
                          <Link
                            to="/employer/dashboard"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">dashboard</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Bảng điều khiển</span>
                          </Link>
                          <Link
                            to="/employer/jobs"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">work</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Quản lý tin tuyển dụng</span>
                          </Link>
                          <Link
                            to="/employer/applications"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">folder_shared</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Hồ sơ ứng tuyển</span>
                          </Link>
                          <Link
                            to="/employer/profile"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">business</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Thông tin công ty</span>
                          </Link>
                        </>
                      ) : user?.role === UserRole.ADMIN ? (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">dashboard</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">Bảng điều khiển</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/candidate/dashboard"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">dashboard</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Bảng điều khiển</span>
                          </Link>
                          <Link
                            to="/candidate/profile"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">person</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Hồ sơ cá nhân</span>
                          </Link>
                          <Link
                            to="/candidate/cv-management"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">description</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Quản lý CV</span>
                          </Link>
                          <Link
                            to="/candidate/applications"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">assignment</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Việc đã ứng tuyển</span>
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="text-sm font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
                  >
                    Đăng ký ngay
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-white">work</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">Jobly.vn</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Nền tảng kết nối nhân tài và nhà tuyển dụng hàng đầu tại Việt Nam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-all">
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-all">
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-all">
                <span className="material-symbols-outlined text-lg">call</span>
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Ứng viên</h5>
            <ul className="space-y-4 text-sm">
              <li><Link to="/jobs" className="hover:text-primary transition-colors">Tìm việc làm</Link></li>
              <li><Link to="/jobs?category=it" className="hover:text-primary transition-colors">Việc làm IT</Link></li>
              <li><Link to="/cv-builder" className="hover:text-primary transition-colors">Mẫu CV chuyên nghiệp</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Nhà tuyển dụng</h5>
            <ul className="space-y-4 text-sm">
              <li><Link to="/employer/jobs/new" className="hover:text-primary transition-colors">Đăng tin tuyển dụng</Link></li>
              <li><Link to="/employer/candidates" className="hover:text-primary transition-colors">Tìm kiếm hồ sơ</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Tải ứng dụng</h5>
            <p className="text-sm mb-4">Trải nghiệm tìm việc dễ dàng hơn trên điện thoại.</p>
            <div className="space-y-3">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center gap-3 cursor-pointer hover:border-primary transition-all">
                <span className="material-symbols-outlined text-3xl">phone_iphone</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Available on</p>
                  <p className="text-xs font-bold text-white">App Store</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2024 Jobly.vn - Bản quyền thuộc về Công ty CP Jobly Vietnam.</p>
          <div className="flex gap-6">
            {/* <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Trợ giúp</Link> */}
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChat />
    </div>
  )
}
