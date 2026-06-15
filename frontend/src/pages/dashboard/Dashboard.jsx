import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`text-4xl p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get('/api/rooms/').then(r => r.data)
  })
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/api/bookings/').then(r => r.data)
  })
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/api/invoices/').then(r => r.data)
  })

  const available = rooms.filter(r => r.status === 'available').length
  const occupied = rooms.filter(r => r.status === 'occupied').length
  const maintenance = rooms.filter(r => r.status === 'maintenance').length
  const activeBookings = bookings.filter(b => ['confirmed','checked_in'].includes(b.status)).length
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0)

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const statusColor = {
    confirmed: 'bg-blue-100 text-blue-700',
    checked_in: 'bg-green-100 text-green-700',
    checked_out: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Rooms" value={rooms.length} icon="🛏️" color="bg-blue-50" />
        <StatCard title="Available" value={available} icon="✅" color="bg-green-50" />
        <StatCard title="Occupied" value={occupied} icon="🔴" color="bg-red-50" />
        <StatCard title="Maintenance" value={maintenance} icon="🔧" color="bg-yellow-50" />
      </div>

      <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 mb-8`}>
        <StatCard title="Active Bookings" value={activeBookings} icon="📋" color="bg-purple-50" />
        <StatCard title="Total Bookings" value={bookings.length} icon="📅" color="bg-indigo-50" />
        {user?.role === 'admin' && (
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon="💰" color="bg-emerald-50" />
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-800">Recent Bookings</h2>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Guest</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Room</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Check-in</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Check-out</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{b.guest_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Room {b.room?.room_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{b.check_in}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{b.check_out}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor[b.status]}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}