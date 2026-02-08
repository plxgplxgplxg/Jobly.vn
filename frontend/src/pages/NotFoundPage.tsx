import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '120px' }}>
            search_off
          </span>
        </div>
        
        <h1 className="text-6xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
          Không tìm thấy trang
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" size="lg">
              <span className="material-symbols-outlined">home</span>
              Về trang chủ
            </Button>
          </Link>
          
          <Link to="/jobs">
            <Button variant="outline" size="lg">
              <span className="material-symbols-outlined">search</span>
              Tìm việc làm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
