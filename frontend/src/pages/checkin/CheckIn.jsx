import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'

const statusColor = {
  confirmed:   'bg-blue-100 text-blue-700',
  checked_in:  'bg-green-100 text-green-700',
  checked_out: 'bg-gray-100 text-gray-700',
  cancelled:   'bg-red-100 text-red-700',
}

export default function CheckIn() {
  const qc = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/api/bookings/').then(r => r.data)
  })

  const checkIn = useMutation({
    mutationFn: id => api.post(`/api/checkin/${id}/checkin`),
    onSuccess: () => { qc.invalidateQueries(['bookings']); qc.invalidateQueries(['rooms']) }
  })

  const checkOut = useMutation({
    mutationFn: id => api.post(`/api/checkin/${id}/checkout`),
    onSuccess: () => { qc.invalidateQueries(['bookings']); qc.invalidateQueries(['rooms']); qc.invalidateQueries(['invoices']) }
  })

  const active = bookings.filter(b => ['confirmed','checked_in'].includes(b.status))

  const nights = (checkin, checkout) => {
    const diff = new Date(checkout) - new Date(checkin)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Check-in / Check-out</h1>
        <p className="text-slate-500 text-sm mt-1">{active.length} active bookings</p>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Loading...</div>
      ) : active.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium">No active bookings</p>
          <p className="text-sm mt-1">Create a booking first</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {active.map(b => {
            const n = nights(b.check_in, b.check_out)
            const total = n * (b.room?.price_per_night || 0)
            return (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-800">{b.guest_name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor[b.status]}`}>
                        {b.status.replace('_',' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Room</p>
                        <p className="font-medium text-slate-700">#{b.room?.room_number} — {b.room?.room_type}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Check-in</p>
                        <p className="font-medium text-slate-700">{b.check_in}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Check-out</p>
                        <p className="font-medium text-slate-700">{b.check_out}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Duration / Amount</p>
                        <p className="font-medium text-slate-700">{n} nights — ₹{total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col gap-2">
                    {b.status === 'confirmed' && (
                      <button onClick={() => checkIn.mutate(b.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                        ✅ Check In
                      </button>
                    )}
                    {b.status === 'checked_in' && (
                      <button onClick={() => checkOut.mutate(b.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                        🚪 Check Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}