import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite']
const STATUSES = ['available', 'occupied', 'maintenance']

const statusColor = {
  available:   'bg-green-100 text-green-700',
  occupied:    'bg-red-100 text-red-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
}

const empty = { room_number: '', room_type: 'Standard', price_per_night: '', status: 'available', description: '' }

export default function Rooms() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get('/api/rooms/').then(r => r.data)
  })

  const createRoom = useMutation({
    mutationFn: data => api.post('/api/rooms/', data),
    onSuccess: () => { toast.success('Room created successfully!'); qc.invalidateQueries(['rooms']); closeModal() },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to create room')
  })

  const updateRoom = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/rooms/${id}`, data),
    onSuccess: () => { toast.success('Room updated successfully!'); qc.invalidateQueries(['rooms']); closeModal() },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to update room')
  })

  const deleteRoom = useMutation({
    mutationFn: id => api.delete(`/api/rooms/${id}`),
    onSuccess: () => { toast.success('Room deleted successfully!'); qc.invalidateQueries(['rooms']) },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to delete room')
  })

  const openCreate = () => { setForm(empty); setEditing(null); setShowModal(true) }
  const openEdit = room => {
    setForm({ room_number: room.room_number, room_type: room.room_type,
      price_per_night: room.price_per_night, status: room.status, description: room.description || '' })
    setEditing(room.id); setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(empty) }

  const handleSubmit = e => {
    e.preventDefault()
    const data = { ...form, price_per_night: parseFloat(form.price_per_night) }
    if (editing) updateRoom.mutate({ id: editing, data })
    else createRoom.mutate(data)
  }

  const filtered = rooms.filter(r => 
    (filterStatus === 'all' || r.status === filterStatus) &&
    (filterType === 'all' || r.room_type === filterType)
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rooms</h1>
          <p className="text-slate-500 text-sm mt-1">{rooms.length} total rooms</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Room
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {STATUSES.map(s => (
          <div key={s} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-slate-800">{rooms.filter(r => r.status === s).length}</p>
          Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <ofiltered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">🛏️</p>
            <p className="font-medium">No rooms match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search criteria
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">🛏️</p>
            <p className="font-medium">No rooms yet</p>
            <p className="text-sm mt-1">Click "Add Room" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Room No.','Type','Price/Night','Status','Description','Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(room => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">#{room.room_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{room.room_type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">₹{room.price_per_night.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor[room.status]}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{room.description || '—'}</td>
                    <td className="px-6 py-4">
                      {user?.role === 'admin' && (
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(room)}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg transition-colors">
                            Edit
                          </button>
                          <button onClick={() => { if(confirm('Delete this room?')) deleteRoom.mutate(room.id) }}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg transition-colors">
                            Delete
                          </button>
                        </div>
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
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {editing ? 'Edit Room' : 'Add New Room'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                <input required value={form.room_number} disabled={!!editing}
                  onChange={e => setForm({...form, room_number: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  placeholder="e.g. 101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                <select value={form.room_type} onChange={e => setForm({...form, room_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price per Night (₹)</label>
                <input required type="number" min="0" value={form.price_per_night}
                  onChange={e => setForm({...form, price_per_night: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <textarea value={form.description} rows={2}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sea view, king bed..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                  {editing ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}