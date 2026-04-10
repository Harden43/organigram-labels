'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Tag, ClipboardList, AlertTriangle, Package, LogOut } from 'lucide-react'
import { clearSession, getSession } from '@/lib/auth'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate Label', icon: Tag },
  { href: '/tracker', label: 'WO Tracker', icon: ClipboardList },
  { href: '/mismatches', label: 'Mismatches', icon: AlertTriangle },
  { href: '/skus', label: 'SKU Master', icon: Package },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState('')

  useEffect(() => {
    const s = getSession()
    if (!s.authenticated) router.push('/login')
    setUser(s.user)
  }, [router])

  function logout() {
    clearSession()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[#1a1a18] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold font-mono">OG</span>
          </div>
          <div>
            <div className="text-white text-xs font-semibold font-mono tracking-wider">ORGANIGRAM</div>
            <div className="text-gray-500 text-[10px] font-mono">Label Generator</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-[11px] text-gray-500 font-mono mb-2 truncate">{user}</div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs transition-colors w-full"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
