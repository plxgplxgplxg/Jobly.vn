import { Link } from 'react-router-dom'
import { RegisterForm } from '../../components/forms/RegisterForm'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-3xl">work</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-primary">Jobly.vn</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Tạo tài khoản mới để bắt đầu
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-slate-900 py-8 px-4 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
