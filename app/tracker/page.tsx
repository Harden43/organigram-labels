'use client'
import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/AppLayout'
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const LABEL_COLORS: Record<string, string> = {
  bs: 'bg-blue-50 text-blue-700',
  mc: 'bg-purple-50 text-purple-700',
  both: 'bg-green-50 text-green-700',
}

export default function TrackerPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const limit = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/labels?search=${encodeURIComponent(search)}&page=${page}`)
    const json = await res.json()
    setData(json.data || [])
    setCount(json.count || 0)
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = Math.ceil(count / limit)

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">WO Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full history of all work orders processed</p>
        </div>

        {/* Search + count */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search WO#, product, lot, SKU..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-brand-400 transition-colors bg-white"
            />
          </div>
          <span className="text-sm text-gray-500 font-mono">{count} records</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Table */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium">WO #</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium">Lot #</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium">By</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 font-mono text-sm">Loading...</td></tr>
                  ) : !data.length ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 font-mono text-sm">No work orders found</td></tr>
                  ) : data.map(wo => (
                    <tr
                      key={wo.id}
                      onClick={() => setSelected(wo)}
                      className={clsx('cursor-pointer hover:bg-gray-50 transition-colors', selected?.id === wo.id && 'bg-brand-50')}
                    >
                      <td className="px-5 py-3 font-mono text-xs font-medium text-gray-900">{wo.wo_number}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{wo.product_name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{wo.lot_number}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-[10px] font-mono px-2 py-0.5 rounded-full', LABEL_COLORS[wo.label_type] || 'bg-gray-100 text-gray-600')}>
                          {wo.label_type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{wo.printed_by?.split(' ')[0]}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {wo.created_at ? format(new Date(wo.created_at), 'MMM d HH:mm') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <ExternalLink size={20} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400 font-mono">Click a row to see<br />full WO details</p>
              </div>
            ) : (
              <div>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 font-mono text-sm">{selected.wo_number}</h3>
                  <span className={clsx('text-[10px] font-mono px-2 py-0.5 rounded-full', LABEL_COLORS[selected.label_type])}>
                    {selected.label_type?.toUpperCase()}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Product', val: selected.product_name },
                    { label: 'Brand', val: selected.brand_name },
                    { label: 'SKU', val: selected.sku },
                    { label: 'Lot #', val: selected.lot_number, highlight: true },
                    { label: 'Formulation Lot', val: selected.formulation_lot },
                    { label: 'Packaged On', val: selected.packaged_on_date },
                    { label: 'THC', val: selected.thc ? `${selected.thc} mg/g` : '—', highlight: true },
                    { label: 'Total THC', val: selected.total_thc ? `${selected.total_thc} mg/g` : '—', highlight: true },
                    { label: 'CBD', val: selected.cbd ? `${selected.cbd} mg/g` : '—' },
                    { label: 'Total CBD', val: selected.total_cbd ? `${selected.total_cbd} mg/g` : '—' },
                    { label: 'Units/Pack', val: selected.units_per_pack },
                    { label: 'Total Units', val: selected.total_units },
                    { label: 'Total MCs', val: selected.total_master_cases },
                    { label: 'Printed By', val: selected.printed_by },
                    { label: 'Printed At', val: selected.printed_at ? format(new Date(selected.printed_at), 'MMM d yyyy HH:mm') : '—' },
                  ].map(({ label, val, highlight }) => (
                    <div key={label} className="flex justify-between items-start gap-4">
                      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
                      <span className={clsx('text-xs font-medium text-right', highlight ? 'text-brand-600 font-mono' : 'text-gray-800')}>{val || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
