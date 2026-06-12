import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/',         label: '📊 Dashboard' },
  { to: '/rooms',    label: '🛏️ Rooms'      },
  { to: '/bookings', label: '📋 Bookings'  },
  { to: '/checkin',  label: '✅ Check-in'  },
  { to: '/invoices', label: '🧾 Invoices'  },
  { to: '/calendar', label: '📅 Calendar'  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">🏨 Hotel PMS</h1>
          <p className="text-slate-400 text-sm mt-1">{user?.full_name}</p>
          <span className="text-xs bg-slate-600 px-2 py-0.5 rounded-full capitalize">
            {user?.role}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg text-left"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}