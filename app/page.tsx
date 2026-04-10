'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AppLayout from '@/components/AppLayout'
import { Tag, ClipboardList, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Stats {
  todayWOs: number
  weekWOs: number
  totalMismatches: number
  unresolvedMismatches: number
  recentWOs: any[]
  recentMismatches: any[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (!s.authenticated) { router.push('/login'); return }
    setUser(s.user)
    fetchStats()
  }, [router])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch {}
    setLoading(false)
  }

  const today = format(new Date(), 'EEEE, MMMM d yyyy')

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono text-gray-400 mb-1">{today}</p>
          <h1 className="text-2xl font-semibold text-gray-900">Good {getGreeting()}, {user.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-1">Here's your labelling operations overview</p>
        </div>

        {/* Quick action */}
        <Link href="/generate" className="block mb-8">
          <div className="bg-brand-500 hover:bg-brand-600 transition-colors rounded-2xl p-6 flex items-center justify-between group cursor-pointer">
            <div>
              <p className="text-brand-100 text-xs font-mono uppercase tracking-wider mb-1">Ready to start?</p>
              <h2 className="text-white text-xl font-semibold">Generate a label</h2>
              <p className="text-brand-200 text-sm mt-1">Upload WO + spec sheet screenshots</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Tag size={24} className="text-white" />
            </div>
          </div>
        </Link>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="WOs today"
            value={loading ? '—' : String(stats?.todayWOs ?? 0)}
            icon={<Tag size={16} />}
            color="blue"
          />
          <StatCard
            label="WOs this week"
            value={loading ? '—' : String(stats?.weekWOs ?? 0)}
            icon={<ClipboardList size={16} />}
            color="green"
          />
          <StatCard
            label="Mismatches caught"
            value={loading ? '—' : String(stats?.totalMismatches ?? 0)}
            icon={<AlertTriangle size={16} />}
            color="amber"
          />
          <StatCard
            label="Unresolved flags"
            value={loading ? '—' : String(stats?.unresolvedMismatches ?? 0)}
            icon={<AlertTriangle size={16} />}
            color={stats && stats.unresolvedMismatches > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent WOs */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 text-sm">Recent work orders</h3>
              <Link href="/tracker" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400 font-mono">Loading...</div>
              ) : !stats?.recentWOs?.length ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400 font-mono">No work orders yet</div>
              ) : stats.recentWOs.map((wo: any) => (
                <div key={wo.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{wo.wo_number}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">{wo.product_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${wo.label_type === 'bs' ? 'bg-blue-50 text-blue-600' : wo.label_type === 'mc' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                      {wo.label_type?.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{wo.printed_by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent mismatches */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 text-sm">Recent mismatches caught</h3>
              <Link href="/mismatches" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400 font-mono">Loading...</div>
              ) : !stats?.recentMismatches?.length ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400 font-mono">
                  <CheckCircle size={20} className="text-green-400 mx-auto mb-2" />
                  No mismatches logged
                </div>
              ) : stats.recentMismatches.map((mm: any) => (
                <div key={mm.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{mm.wo_number}</p>
                    <p className="text-xs text-gray-500">{mm.field_name}: <span className="text-red-500">{mm.wo_value}</span> → <span className="text-green-600">{mm.label_value}</span></p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${mm.resolved ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {mm.resolved ? 'Resolved' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
