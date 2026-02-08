import { useState, useEffect } from 'react'
import { adminService, type AdminUser } from '../../services/api/admin.service'

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const limit = 20

  useEffect(() => {
    loadUsers()
  }, [page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getUsers(page, limit)
      setUsers(response.data)
      setTotal(response.total)
    } catch (err) {
      setError('Không thể tải danh sách người dùng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const results = await adminService.searchUsers(searchQuery)
      setUsers(results)
      setTotal(results.length)
    } catch (err) {
      setError('Không thể tìm kiếm người dùng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLockUser = async (userId: string) => {
    const reason = window.prompt('Nhập lý do khóa tài khoản:')
    if (reason === null) return

    try {
      await adminService.lockUser(userId, reason)
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'locked' } : user
      ))
    } catch (err) {
      setError('Không thể khóa người dùng')
      console.error(err)
    }
  }

  const handleUnlockUser = async (userId: string) => {
    try {
      await adminService.unlockUser(userId)
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'active' } : user
      ))
    } catch (err) {
      setError('Không thể mở khóa/duyệt người dùng')
      console.error(err)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchRole = filterRole === 'all' || user.role === filterRole
    const matchStatus = filterStatus === 'all' || user.status === filterStatus
    return matchRole && matchStatus
  })

  const totalPages = Math.ceil(total / limit)

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
        <p className="text-gray-600">Quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="candidate">Ứng viên</option>
              <option value="employer">Nhà tuyển dụng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="locked">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'employer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {user.role === 'admin' ? 'Quản trị viên' :
                          user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {user.status === 'active' ? 'Hoạt động' :
                          user.status === 'pending' ? 'Chờ duyệt' :
                            user.status === 'locked' ? 'Bị khóa' : 'Đã xóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.status === 'pending' ? (
                        <button
                          onClick={() => handleUnlockUser(user.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                        >
                          Duyệt
                        </button>
                      ) : user.status === 'active' ? (
                        <button
                          onClick={() => handleLockUser(user.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                        >
                          Khóa
                        </button>
                      ) : user.status === 'locked' ? (
                        <button
                          onClick={() => handleUnlockUser(user.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                        >
                          Mở khóa
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> trong{' '}
                  <span className="font-medium">{total}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
