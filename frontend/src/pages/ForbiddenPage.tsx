import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useAuthStore } from '../store/authStore'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  const handleGoBack = () => {
    navigate(-1)
  }
  
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="material-symbols-outlined text-red-500" style={{ fontSize: '120px' }}>
            block
          </span>
        </div>
        
        <h1 className="text-6xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
          403
        </h1>
        
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
          Truy cập bị từ chối
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {isAuthenticated 
            ? 'Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.'
            : 'Bạn cần đăng nhập để truy cập trang này.'
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Button variant="primary" size="lg" onClick={handleGoBack}>
                <span className="material-symbols-outlined">arrow_back</span>
                Quay lại
              </Button>
              
              <Link to="/">
                <Button variant="outline" size="lg">
                  <span className="material-symbols-outlined">home</span>
                  Về trang chủ
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="primary" size="lg">
                  <span className="material-symbols-outlined">login</span>
                  Đăng nhập
                </Button>
              </Link>
              
              <Link to="/">
                <Button variant="outline" size="lg">
                  <span className="material-symbols-outlined">home</span>
                  Về trang chủ
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
