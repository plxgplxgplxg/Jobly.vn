import { useState, useEffect } from 'react'
import { adminService, type AdminUser } from '../../services/api/admin.service'
import { Pagination } from '../../components/common/Pagination'

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const limit = 10

  useEffect(() => {
    loadUsers()
  }, [page, filterRole, filterStatus])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: any = { page, limit }
      if (filterRole !== 'all') params.role = filterRole
      if (filterStatus !== 'all') params.status = filterStatus
      if (searchQuery.trim()) params.keyword = searchQuery.trim()
      const response = await adminService.getUsers(params)
      setUsers(response.items)
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (err) {
      setError('Không thể tải danh sách người dùng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setPage(1)
    loadUsers()
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

  const handleRejectUser = async (userId: string) => {
    const reason = window.prompt('Nhập lý do từ chối:')
    if (reason === null) return

    try {
      await adminService.rejectUser(userId, reason)
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'deleted' } : user
      ))
    } catch (err) {
      setError('Không thể từ chối người dùng')
      console.error(err)
    }
  }



  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản người dùng trong hệ thống (Tổng cộng: {total})</p>
        </div>
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
              onChange={(e) => { setFilterRole(e.target.value); setPage(1) }}
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
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUnlockUser(user.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>

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

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
