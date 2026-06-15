import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const empty = { name: '', email: '', phone: '', address: '', id_type: '', id_number: '' }

export default function Guests() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [history, setHistory] = useState([])

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: () => api.get('/api/guests/').then(r => r.data)
  })

  const createGuest = useMutation({
    mutationFn: data => api.post('/api/guests/', data),
    onSuccess: () => { toast.success('Guest created successfully!'); qc.invalidateQueries(['guests']); closeModal() },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to create guest')
  })

  const updateGuest = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/guests/${id}`, data),
    onSuccess: () => { toast.success('Guest updated successfully!'); qc.invalidateQueries(['guests']); closeModal() },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to update guest')
  })

  const deleteGuest = useMutation({
    mutationFn: id => api.delete(`/api/guests/${id}`),
    onSuccess: () => { toast.success('Guest deleted successfully!'); qc.invalidateQueries(['guests']) },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to delete guest')
  })

  const openCreate = () => { setForm(empty); setEditing(null); setShowModal(true) }
  const openEdit = guest => {
    setForm({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      address: guest.address || '',
      id_type: guest.id_type || '',
      id_number: guest.id_number || ''
    })
    setEditing(guest.id)
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(empty) }

  const handleSubmit = e => {
    e.preventDefault()
    
    // Validation
    if (!form.name.trim()) {
      toast.error('Guest name is required')
      return
    }
    if (!form.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!form.phone.trim()) {
      toast.error('Phone number is required')
      return
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Phone number must be at least 10 digits')
      return
    }
    if (!form.id_type.trim()) {
      toast.error('ID type is required')
      return
    }
    if (!form.id_number.trim()) {
      toast.error('ID number is required')
      return
    }
    
    if (editing) updateGuest.mutate({ id: editing, data: form })
    else createGuest.mutate(form)
  }

  const viewHistory = async (guest) => {
    setSelectedGuest(guest)
    try {
      const res = await api.get(`/api/guests/${guest.id}/history`)
      setHistory(res.data)
      setShowHistory(true)
    } catch (err) {
      toast.error('Failed to load guest history')
    }
  }

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Guests</h1>
          <p className="text-slate-500 text-sm mt-1">{guests.length} total guests</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Guest
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading guests...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium">No guests found</p>
            <p className="text-sm mt-1">Create a guest profile to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Phone', 'ID Type', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(guest => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{guest.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{guest.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{guest.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{guest.id_type || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(guest.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => viewHistory(guest)}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg transition-colors">
                          History
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <button onClick={() => openEdit(guest)}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg transition-colors">
                              Edit
                            </button>
                            <button onClick={() => { if(confirm('Delete this guest?')) deleteGuest.mutate(guest.id) }}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg transition-colors">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {editing ? 'Edit Guest' : 'Add New Guest'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input required value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input required type="email" value={form.email} disabled={!!editing}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone * (min. 10 digits)</label>
                <input required value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${form.phone && form.phone.replace(/\\D/g, '').length < 10 ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="+91 98765 43210" />
                {form.phone && form.phone.replace(/\D/g, '').length < 10 && (
                  <p className="text-xs text-red-500 mt-1">❌ Phone must have at least 10 digits</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ID Type *</label>
                  <select required value={form.id_type} onChange={e => setForm({...form, id_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="passport">Passport</option>
                    <option value="driver_license">Driver License</option>
                    <option value="aadhar">Aadhar</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ID Number *</label>
                  <input required value={form.id_number} disabled={!!editing}
                    onChange={e => setForm({...form, id_number: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="ABC123..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                  {editing ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Booking History - {selectedGuest?.name}
              </h2>
              <button onClick={() => setShowHistory(false)}
                className="text-2xl text-slate-400 hover:text-slate-600">×</button>
            </div>
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-4xl mb-3">📋</p>
                <p>No booking history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(b => (
                  <div key={b.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">Room {b.room_number}</p>
                        <p className="text-sm text-slate-600">{b.check_in} to {b.check_out}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                        b.status === 'checked_out' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
