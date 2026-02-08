import { Outlet, Link } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'

export function AuthLayout() {
  const { theme, toggleTheme } = useUIStore()

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Simple Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white">work</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-primary">Jobly.vn</span>
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined text-xl text-slate-700 dark:text-slate-300">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content - Centered Form */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2024 Jobly.vn</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Bảo mật</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Trợ giúp</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
