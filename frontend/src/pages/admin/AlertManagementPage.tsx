import { useState, useEffect } from 'react'
import { adminService, type SendAlertData, type AdminUser } from '../../services/api/admin.service'

export default function AlertManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [alertData, setAlertData] = useState<SendAlertData>({
    message: '',
    type: 'info'
  })
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await adminService.getUsers({ page: 1, limit: 1000 })
      setUsers(response.items)
    } catch (err) {
      setError('Không thể tải danh sách người dùng')
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    const filtered = getFilteredUsers()
    if (selectedUserIds.length === filtered.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(filtered.map(u => u.id))
    }
  }

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!alertData.message.trim()) {
      setError('Vui lòng nhập nội dung thông báo')
      return
    }

    if (selectedUserIds.length === 0) {
      setError('Vui lòng chọn ít nhất một người dùng')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await adminService.sendAlert({
        ...alertData,
        userIds: selectedUserIds
      })

      setSuccess(`Đã gửi thông báo đến ${selectedUserIds.length} người dùng`)
      setAlertData({ message: '', type: 'info' })
      setSelectedUserIds([])
    } catch (err) {
      setError('Không thể gửi thông báo')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchRole = filterRole === 'all' || user.role === filterRole
      const matchSearch = !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      return matchRole && matchSearch
    })
  }

  const filteredUsers = getFilteredUsers()

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gửi Thông báo</h1>
        <p className="text-gray-600">Gửi thông báo đến người dùng trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nội dung thông báo</h2>

          <form onSubmit={handleSendAlert}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại thông báo
              </label>
              <select
                value={alertData.type}
                onChange={(e) => setAlertData({ ...alertData, type: e.target.value as 'info' | 'warning' | 'error' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="info">Thông tin</option>
                <option value="warning">Cảnh báo</option>
                <option value="error">Lỗi</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                value={alertData.message}
                onChange={(e) => setAlertData({ ...alertData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập nội dung thông báo..."
                required
              />
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Đã chọn:</strong> {selectedUserIds.length} người dùng
              </p>
              {selectedUserIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedUserIds([])}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || selectedUserIds.length === 0 || !alertData.message.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn người nhận</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4 flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="candidate">Ứng viên</option>
              <option value="employer">Nhà tuyển dụng</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {selectedUserIds.length === filteredUsers.length ? 'Bỏ chọn' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Không tìm thấy người dùng nào
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleToggleUser(user.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'employer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {user.role === 'admin' ? 'Admin' :
                        user.role === 'employer' ? 'Employer' : 'Candidate'}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
