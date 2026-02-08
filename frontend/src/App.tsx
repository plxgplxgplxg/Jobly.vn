import { useEffect } from 'react'
import { useUIStore } from './store/uiStore'

function App() {
  const { theme, toggleTheme } = useUIStore()

  // Initialize theme khi app load
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-8">
            Jobly.vn <span className="text-primary">Frontend</span>
          </h1>
          
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Dark Mode đã hoạt động!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Theme hiện tại: <span className="font-bold text-primary">{theme}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Theme preference được lưu trong localStorage và sẽ được khôi phục khi bạn quay lại.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
