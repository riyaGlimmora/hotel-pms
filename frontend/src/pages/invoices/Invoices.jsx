import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'

export default function Invoices() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/api/invoices/').then(r => r.data)
  })

  const handlePrint = (inv) => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Invoice #${inv.id}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .total { font-size: 1.5rem; font-weight: bold; color: #2563eb; }
        .badge { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
      </style></head>
      <body>
        <div class="header">
          <h1>🏨 Hotel PMS</h1>
          <h2>Invoice #${inv.id}</h2>
          <span class="badge">PAID</span>
        </div>
        <div class="row"><span>Guest Name</span><strong>${inv.booking?.guest_name}</strong></div>
        <div class="row"><span>Room Number</span><strong>#${inv.booking?.room?.room_number}</strong></div>
        <div class="row"><span>Room Type</span><strong>${inv.booking?.room?.room_type}</strong></div>
        <div class="row"><span>Check-in</span><strong>${inv.booking?.check_in}</strong></div>
        <div class="row"><span>Check-out</span><strong>${inv.booking?.check_out}</strong></div>
        <div class="row"><span>Nights Stayed</span><strong>${inv.nights_stayed}</strong></div>
        <div class="row"><span>Rate per Night</span><strong>₹${inv.room_rate.toLocaleString()}</strong></div>
        <div class="row" style="margin-top:20px">
          <span class="total">Total Amount</span>
          <span class="total">₹${inv.total_amount.toLocaleString()}</span>
        </div>
        <p style="text-align:center; color:#94a3b8; margin-top:40px; font-size:0.8rem;">
          Issued: ${new Date(inv.issued_at).toLocaleString()}
        </p>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
        <p className="text-slate-500 text-sm mt-1">{invoices.length} invoices generated</p>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Loading...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">🧾</p>
          <p className="font-medium">No invoices yet</p>
          <p className="text-sm mt-1">Invoices are generated automatically on check-out</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map(inv => (
            <div key={inv.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Invoice #{inv.id}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
                      PAID
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">Guest</p>
                      <p className="font-medium text-slate-700">{inv.booking?.guest_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Room</p>
                      <p className="font-medium text-slate-700">#{inv.booking?.room?.room_number}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Nights</p>
                      <p className="font-medium text-slate-700">{inv.nights_stayed}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Rate/Night</p>
                      <p className="font-medium text-slate-700">₹{inv.room_rate.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Total</p>
                      <p className="font-bold text-blue-600 text-base">₹{inv.total_amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Issued: {new Date(inv.issued_at).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => handlePrint(inv)}
                  className="ml-6 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                  🖨️ Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}