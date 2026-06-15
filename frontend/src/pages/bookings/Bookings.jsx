import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const statusColor = {
  confirmed:   'bg-blue-100 text-blue-700',
  checked_in:  'bg-green-100 text-green-700',
  checked_out: 'bg-gray-100 text-gray-700',
  cancelled:   'bg-red-100 text-red-700',
}

const empty = { guest_name: '', num_guests: 1, check_in: '', check_out: '', room_id: '' }

export default function Bookings() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [filter, setFilter] = useState('all')
  const [searchGuest, setSearchGuest] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/api/bookings/').then(r => r.data)
  })
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get('/api/rooms/').then(r => r.data)
  })

  const createBooking = useMutation({
    mutationFn: data => api.post('/api/bookings/', data),
    onSuccess: () => { toast.success('Booking created successfully!'); qc.invalidateQueries(['bookings']); qc.invalidateQueries(['rooms']); closeModal() },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to create booking')
  })

  const cancelBooking = useMutation({
    mutationFn: id => api.delete(`/api/bookings/${id}`),
    onSuccess: () => { toast.success('Booking cancelled successfully!'); qc.invalidateQueries(['bookings']); qc.invalidateQueries(['rooms']) },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to cancel booking')
  })

  const closeModal = () => { setShowModal(false); setForm(empty) }

  const handleSubmit = e => {
    e.preventDefault()
    
    // Validation
    if (!form.guest_name.trim()) {
      toast.error('Please enter guest name')
      return
    }
    if (!form.num_guests || parseInt(form.num_guests) <= 0) {
      toast.error('Number of guests must be at least 1')
      return
    }
    if (!form.room_id) {
      toast.error('Please select a room')
      return
    }
    if (!form.check_in) {
      toast.error('Please select check-in date')
      return
    }
    if (!form.check_out) {
      toast.error('Please select check-out date')
      return
    }
    if (form.check_out <= form.check_in) {
      toast.error('Check-out date must be after check-in date')
      return
    }
    
    const checkInDate = new Date(form.check_in)
    const checkOutDate = new Date(form.check_out)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (checkInDate < today) {
      toast.error('Check-in date cannot be in the past')
      return
    }
    
    createBooking.mutate({ ...form, num_guests: parseInt(form.num_guests), room_id: parseInt(form.room_id) })
  }

  const availableRooms = rooms.filter(r => r.status === 'available')
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  
  const withFilters = filtered.filter(b => {
    const matchGuest = b.guest_name.toLowerCase().includes(searchGuest.toLowerCase())
    const matchDateFrom = !dateFrom || b.check_in >= dateFrom
    const matchDateTo = !dateTo || b.check_out <= dateTo
    return matchGuest && matchDateFrom && matchDateTo
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{bookings.length} total bookings</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Booking
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all','confirmed','checked_in','checked_out','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-gray-100 border border-gray-200'
            }`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Search and Date Filters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by guest name..."
          value={searchGuest}
          onChange={e => setSearchGuest(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="To date"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : withFilters.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No bookings match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['#','Guest','Guests','Room','Check-in','Check-out','Status','Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {withFilters.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-slate-400">#{b.id}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-800">{b.guest_name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{b.num_guests}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">Room {b.room?.room_number}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{b.check_in}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{b.check_out}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor[b.status]}`}>
                        {b.status.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {b.status === 'confirmed' && (
                        <button onClick={() => {
                          if(confirm('Are you sure you want to cancel this booking?')) {
                            cancelBooking.mutate(b.id)
                          }
                        }}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">New Booking</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Guest Name *</label>
                <input required value={form.guest_name}
                  onChange={e => setForm({...form, guest_name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Guests *</label>
                <input required type="number" min="1" value={form.num_guests}
                  onChange={e => setForm({...form, num_guests: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room *</label>
                <select required value={form.room_id} onChange={e => setForm({...form, room_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a room</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} — {r.room_type} — ₹{r.price_per_night}/night
                    </option>
                  ))}
                </select>
                {availableRooms.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">❌ No available rooms. All rooms are booked or under maintenance.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-in *</label>
                  <input required type="date" value={form.check_in}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({...form, check_in: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-out *</label>
                  <input required type="date" value={form.check_out}
                    min={form.check_in || new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({...form, check_out: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              {form.check_in && form.check_out && form.check_out > form.check_in && (
                <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-sm text-blue-700">
                  📅 {Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / (1000 * 60 * 60 * 24))} nights
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={createBooking.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={createBooking.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {createBooking.isPending ? '⏳ Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}