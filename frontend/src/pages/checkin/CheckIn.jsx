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

export default function CheckIn() {
  const qc = useQueryClient()
  const [chargesModal, setChargesModal] = useState(null)
  const [chargesForm, setChargesForm] = useState({ description: '', amount: '' })
  const [bookingCharges, setBookingCharges] = useState({})

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/api/bookings/').then(r => r.data)
  })

  const checkIn = useMutation({
    mutationFn: id => api.post(`/api/checkin/${id}/checkin`),
    onSuccess: () => { toast.success('Guest checked in successfully!'); qc.invalidateQueries(['bookings']); qc.invalidateQueries(['rooms']) },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to check in')
  })

  const checkOut = useMutation({
    

  const addCharge = useMutation({
    mutationFn: ({ bookingId, data }) => api.post(`/api/extra-charges/booking/${bookingId}`, data),
    onSuccess: (_, { bookingId }) => { 
      toast.success('Charge added!'); 
      loadCharges(bookingId);
      setChargesForm({ description: '', amount: '' })
    },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to add charge')
  })

  const deleteCharge = useMutation({
    mutationFn: chargeId => api.delete(`/api/extra-charges/${chargeId}`),
    onSuccess: (_, chargeId) => { 
      toast.success('Charge deleted!');
      // Reload charges for the modal
      const bookingId = Object.keys(bookingCharges).find(bid => bookingCharges[bid].some(c => c.id === chargeId))
      if (bookingId) loadCharges(parseInt(bookingId))
    },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to delete charge')
  })

  const loadCharges = async (bookingId) => {
    try {
      const res = await api.get(`/api/extra-charges/booking/${bookingId}`)
      setBookingCharges(prev => ({ ...prev, [bookingId]: res.data }))
    } catch (err) {
      console.log('No charges for this booking')
    }
  }

  const openChargesModal = (booking) => {
    setChargesModal(booking)
    loadCharges(booking.id)
  }

  const handleAddCharge = async (bookingId) => {
    if (!chargesForm.description || !chargesForm.amount) {
      toast.error('Please fill in all fields')
      return
    }
    addCharge.mutate({ bookingId, data: { description: chargesForm.description, amount: parseFloat(chargesForm.amount) } })
  }mutationFn: id => api.post(`/api/checkin/${id}/checkout`),
    onSuccess: () => { toast.success('Guest checked out successfully!'); qc.invalidateQueries(['bookings']); qc.invalidateQueries(['rooms']); qc.invalidateQueries(['invoices']) },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to check out')
  })

  const active = bookings.filter(b => ['confirmed','checked_in'].includes(b.status))

  const nights = (checkin, checkout) => {
    const diff = new Date(checkout) - new Date(checkin)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-8">Room Charge</p>
                        <p className="font-medium text-slate-700">₹{total.toLocaleString()}</p>
                      </div>
                    </div>
                    {b.status === 'checked_in' && bookingCharges[b.id]?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-slate-500 mb-2">Extra Charges:</p>
                        <div className="space-y-1">
                          {bookingCharges[b.id].map(charge => (
                            <div key={charge.id} className="flex justify-between items-center text-sm text-slate-600">
                              <span>{charge.description}</span>
                              <span className="font-medium">₹{charge.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}-slate-500 text-sm mt-1">{active.length} active bookings</p>
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
                      <div className="flex gap-2">
                        {b.status === 'checked_in' && (
                          <button onClick={() => openChargesModal(b)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                            💰 Add Charges
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

      {/* Extra Charges Modal */}
      {chargesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Extra Charges - {chargesModal.guest_name}</h2>
              <button onClick={() => setChargesModal(null)} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
            </div>

            {/* Current Charges */}
            {bookingCharges[chargesModal.id]?.length > 0 ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2 max-h-48 overflow-y-auto">
                {bookingCharges[chargesModal.id].map(charge => (
                  <div key={charge.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{charge.description}</p>
                      <p className="text-slate-600">₹{charge.amount.toLocaleString()}</p>
                    </div>
                    <button onClick={() => deleteCharge.mutate(charge.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-4">No extra charges added yet</p>
            )}

            {/* Add Charge Form */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={chargesForm.description}
                  onChange={e => setChargesForm({...chargesForm, description: e.target.value})}
                  placeholder="e.g., Mini bar, Room service..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={chargesForm.amount}
                  onChange={e => setChargesForm({...chargesForm, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setChargesModal(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 text-sm">
                  Done
                </button>
                <button onClick={() => handleAddCharge(chargesModal.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                  Add Charge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}