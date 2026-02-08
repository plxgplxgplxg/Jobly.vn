import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, UserRole } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { API_BASE_URL } from '../constants/api'

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUIStore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Navigation items dựa trên role
  // Navigation items dựa trên role
  const getNavItems = () => {
    const homeItem = { path: '/', icon: 'home', label: 'Trang chủ' }

    if (user?.role === UserRole.EMPLOYER) {
      return [
        homeItem,
        { path: '/employer/dashboard', icon: 'dashboard', label: 'Bảng điều khiển' },
        { path: '/employer/jobs', icon: 'work', label: 'Quản lý tin tuyển dụng' },
        { path: '/employer/applications', icon: 'folder_shared', label: 'Hồ sơ ứng tuyển' },
        { path: '/employer/candidates', icon: 'search', label: 'Tìm kiếm ứng viên' },
        { path: '/employer/messages', icon: 'chat_bubble', label: 'Tin nhắn' },
        { path: '/employer/profile', icon: 'business', label: 'Thông tin công ty' },
      ]
    } else if (user?.role === UserRole.ADMIN) {
      return [
        homeItem,
        { path: '/admin/dashboard', icon: 'dashboard', label: 'Bảng điều khiển' },
        { path: '/admin/users', icon: 'group', label: 'Quản lý users' },
        { path: '/admin/jobs', icon: 'business_center', label: 'Duyệt tin' },
        { path: '/admin/templates', icon: 'description', label: 'CV Templates' },
        { path: '/admin/alerts', icon: 'notifications', label: 'Thông báo' },
      ]
    } else {
      // Candidate
      return [
        homeItem,
        { path: '/candidate/dashboard', icon: 'dashboard', label: 'Bảng điều khiển' },
        { path: '/candidate/jobs', icon: 'search', label: 'Tìm việc làm' },
        { path: '/candidate/applications', icon: 'description', label: 'Việc đã ứng tuyển' },
        { path: '/candidate/cv-management', icon: 'article', label: 'Quản lý CV' },
        { path: '/candidate/cv-builder', icon: 'edit_document', label: 'Tạo CV' },
        { path: '/candidate/messages', icon: 'chat_bubble', label: 'Tin nhắn' },
        { path: '/candidate/profile', icon: 'person', label: 'Hồ sơ cá nhân' },
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar Navigation */}
      <aside
        className={`
          ${sidebarOpen ? 'w-72' : 'w-20'} 
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
          flex flex-col shrink-0 transition-all duration-300
          fixed md:relative h-full z-40
          ${showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-2xl">work</span>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-primary">Jobly.vn</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user?.role === UserRole.EMPLOYER ? 'Nhà tuyển dụng' : user?.role === UserRole.ADMIN ? 'Quản trị' : 'Ứng viên'}
              </p>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                  ${!sidebarOpen && 'justify-center'}
                `}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}

          {sidebarOpen && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hỗ trợ</p>
              </div>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <span className="material-symbols-outlined">settings</span>
                <span>Cài đặt</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <span className="material-symbols-outlined">help</span>
                <span>Trợ giúp</span>
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && user?.role === UserRole.EMPLOYER && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4">
              <p className="text-sm font-bold text-primary mb-1">Gói Premium</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Tăng 300% lượt tiếp cận ứng viên.
              </p>
              <button className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Nâng cấp ngay
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <span className="material-symbols-outlined">
                {sidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button>

            {/* Search Bar */}
            <div className="hidden lg:block flex-1 max-w-md">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Tìm kiếm..."
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

            {/* User Menu */}
            <div className="relative group">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{user?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {user?.role === UserRole.EMPLOYER ? 'Nhà tuyển dụng' : user?.role === UserRole.ADMIN ? 'Quản trị viên' : 'Ứng viên'}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-bold border-2 border-primary/20 group-hover:border-primary transition-all">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)
                  )}
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <div className="p-2">
                  {user?.role === UserRole.CANDIDATE && (
                    <>
                      <Link
                        to="/candidate/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">dashboard</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Bảng điều khiển</span>
                      </Link>
                      <Link
                        to="/candidate/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">person</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Hồ sơ cá nhân</span>
                      </Link>
                    </>
                  )}
                  {user?.role === UserRole.EMPLOYER && (
                    <>
                      <Link
                        to="/employer/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">dashboard</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Bảng điều khiển</span>
                      </Link>
                      <Link
                        to="/employer/jobs"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">work</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Quản lý tin tuyển dụng</span>
                      </Link>
                      <Link
                        to="/employer/candidates"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">search</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Tìm kiếm ứng viên</span>
                      </Link>
                      <Link
                        to="/employer/messages"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chat_bubble</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Tin nhắn</span>
                      </Link>
                      <Link
                        to="/employer/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">business</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Thông tin công ty</span>
                      </Link>
                    </>
                  )}
                  {user?.role === UserRole.ADMIN && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">dashboard</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">Bảng điều khiển</span>
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">settings</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Cài đặt</span>
                  </Link>
                </div>
                <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
