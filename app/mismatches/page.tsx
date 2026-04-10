'use client'
import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/AppLayout'
import { AlertTriangle, CheckCircle, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { getSession } from '@/lib/auth'
import clsx from 'clsx'

export default function MismatchesPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const param = filter === 'open' ? '&resolved=false' : filter === 'resolved' ? '&resolved=true' : ''
    const res = await fetch(`/api/mismatches?${param}`)
    const json = await res.json()
    setData(json.data || [])
    setCount(json.count || 0)
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  async function resolve(id: string) {
    setResolving(id)
    const { user } = getSession()
    await fetch('/api/mismatches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resolved: true, resolved_by: user }),
    })
    await fetchData()
    setResolving(null)
  }

  const openCount = data.filter(m => !m.resolved).length

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mismatch Log</h1>
            <p className="text-sm text-gray-500 mt-0.5">Every lot/potency mismatch caught before printing</p>
          </div>
          {openCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle size={14} />
              {openCount} unresolved
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total caught', val: count, color: 'text-gray-900' },
            { label: 'Unresolved', val: data.filter(m => !m.resolved).length, color: 'text-red-600' },
            { label: 'Resolved', val: data.filter(m => m.resolved).length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className={clsx('text-2xl font-semibold', s.color)}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-5">
          <Filter size={14} className="text-gray-400" />
          {(['all', 'open', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['WO #', 'Product', 'Field', 'WO Value', 'Label Value', 'Caught By', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400 font-mono text-sm">Loading...</td></tr>
                ) : !data.length ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16">
                      <CheckCircle size={24} className="text-green-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-mono">No mismatches logged</p>
                    </td>
                  </tr>
                ) : data.map(mm => (
                  <tr key={mm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{mm.wo_number}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs max-w-[120px] truncate">{mm.product_name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{mm.field_name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-red-600 font-medium">{mm.wo_value || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-green-700 font-medium">{mm.label_value || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{mm.caught_by?.split(' ')[0]}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                      {mm.caught_at ? format(new Date(mm.caught_at), 'MMM d HH:mm') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[10px] font-mono px-2 py-0.5 rounded-full',
                        mm.resolved ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      )}>
                        {mm.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!mm.resolved && (
                        <button
                          onClick={() => resolve(mm.id)}
                          disabled={resolving === mm.id}
                          className="text-xs text-brand-600 hover:text-brand-800 font-medium disabled:opacity-40"
                        >
                          {resolving === mm.id ? 'Saving...' : 'Resolve'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to log mismatches note */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
          <strong>How to log a mismatch:</strong> When you catch a discrepancy between your WO and the extracted label data in the Generate page, use the button below to log it before correcting and printing.
        </div>
      </div>
    </AppLayout>
  )
}
