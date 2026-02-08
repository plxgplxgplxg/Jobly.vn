import { useState, useEffect } from 'react'
import { adminService, type AdminStats } from '../../services/api/admin.service'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getStats(startDate, endDate)
      setStats(data)
    } catch (err) {
      setError('Không thể tải thống kê')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      loadStats(dateRange.startDate, dateRange.endDate)
    } else {
      loadStats()
    }
  }

  const handleResetDateRange = () => {
    setDateRange({ startDate: '', endDate: '' })
    loadStats()
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h1>
        <p className="text-gray-600">Tổng quan về hệ thống</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lọc theo thời gian</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleDateRangeChange}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
            <button
              onClick={handleResetDateRange}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Tổng người dùng"
              value={stats.totalUsers}
              icon="👥"
              color="blue"
            />
            <StatsCard
              title="Tổng tin tuyển dụng"
              value={stats.totalJobs}
              icon="💼"
              color="green"
            />
            <StatsCard
              title="Tổng đơn ứng tuyển"
              value={stats.totalApplications}
              icon="📄"
              color="purple"
            />
            <StatsCard
              title="Doanh thu"
              value={`${stats.revenue.toLocaleString()} VND`}
              icon="💰"
              color="yellow"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Người dùng theo thời gian
              </h2>
              {stats.usersOverTime && stats.usersOverTime.length > 0 ? (
                <div className="space-y-2">
                  {stats.usersOverTime.slice(-10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString('vi-VN')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (item.count / Math.max(...stats.usersOverTime.map(i => i.count))) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tin tuyển dụng theo thời gian
              </h2>
              {stats.jobsOverTime && stats.jobsOverTime.length > 0 ? (
                <div className="space-y-2">
                  {stats.jobsOverTime.slice(-10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString('vi-VN')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (item.count / Math.max(...stats.jobsOverTime.map(i => i.count))) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thống kê tổng quan
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium mb-1">Trung bình người dùng/ngày</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.usersOverTime && stats.usersOverTime.length > 0
                    ? Math.round(stats.usersOverTime.reduce((sum, item) => sum + item.count, 0) / stats.usersOverTime.length)
                    : 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium mb-1">Trung bình tin tuyển dụng/ngày</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.jobsOverTime && stats.jobsOverTime.length > 0
                    ? Math.round(stats.jobsOverTime.reduce((sum, item) => sum + item.count, 0) / stats.jobsOverTime.length)
                    : 0}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-1">Tỷ lệ ứng tuyển/tin</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.totalJobs > 0
                    ? (stats.totalApplications / stats.totalJobs).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'yellow'
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
