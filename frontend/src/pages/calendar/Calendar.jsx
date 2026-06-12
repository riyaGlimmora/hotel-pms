import { useQuery } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '../../api/axios'

const statusColors = {
  confirmed:   '#3b82f6',
  checked_in:  '#22c55e',
  checked_out: '#94a3b8',
  cancelled:   '#ef4444',
}

export default function Calendar() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/api/bookings/').then(r => r.data)
  })

  const events = bookings
    .filter(b => b.status !== 'cancelled')
    .map(b => ({
      id: String(b.id),
      title: `${b.guest_name} — Rm ${b.room?.room_number}`,
      start: b.check_in,
      end: b.check_out,
      backgroundColor: statusColors[b.status],
      borderColor: statusColors[b.status],
    }))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Availability Calendar</h1>
        <p className="text-slate-500 text-sm mt-1">Visual overview of all bookings</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="capitalize">{status.replace('_',' ')}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          eventClick={(info) => {
            const b = bookings.find(b => String(b.id) === info.event.id)
            if (b) alert(`Guest: ${b.guest_name}\nRoom: ${b.room?.room_number}\nCheck-in: ${b.check_in}\nCheck-out: ${b.check_out}\nStatus: ${b.status}`)
          }}
        />
      </div>
    </div>
  )
}