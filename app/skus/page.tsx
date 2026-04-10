'use client'
import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/AppLayout'
import { Plus, Search, Pencil, Trash2, X, Save } from 'lucide-react'
import clsx from 'clsx'

const EMPTY_SKU = {
  sku: '', product_name: '', brand_name: '', product_category: '',
  label_type: 'blank', stock_size: '', printer_profile: '',
  file_location: '', file_source: 'sharepoint', units_per_pack: '',
  product_gtin: '', province: '', notes: '',
}

const LABEL_TYPES = ['blank', 'pre-printed', 'tube', 'pouch', 'bs', 'other']
const FILE_SOURCES = ['sharepoint', 'dcm', 'both']

export default function SKUsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<any>({ ...EMPTY_SKU })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/skus?search=${encodeURIComponent(search)}`)
    const json = await res.json()
    setData(json.data || [])
    setLoading(false)
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY_SKU })
    setShowForm(true)
  }

  function openEdit(sku: any) {
    setEditing(sku)
    setForm({ ...sku })
    setShowForm(true)
  }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch('/api/skus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
    } else {
      await fetch('/api/skus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setShowForm(false)
    fetchData()
  }

  async function remove(id: string) {
    if (!confirm('Remove this SKU from the master table?')) return
    await fetch('/api/skus', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">SKU Master Table</h1>
            <p className="text-sm text-gray-500 mt-0.5">All SKUs with label type, file location, and print settings</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> Add SKU
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search SKU or product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-brand-400 transition-colors bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['SKU', 'Product Name', 'Brand', 'Category', 'Label Type', 'Units/Pack', 'File Source', 'Stock Size', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400 font-mono text-sm">Loading...</td></tr>
                ) : !data.length ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400 font-mono text-sm">No SKUs yet. Click "Add SKU" to get started.</td></tr>
                ) : data.map(sku => (
                  <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{sku.sku}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">{sku.product_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{sku.brand_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{sku.product_category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{sku.label_type || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 text-center">{sku.units_per_pack || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[10px] font-mono px-2 py-0.5 rounded',
                        sku.file_source === 'dcm' ? 'bg-purple-50 text-purple-700' :
                          sku.file_source === 'both' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      )}>{sku.file_source || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{sku.stock_size || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(sku)} className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => remove(sku.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{editing ? 'Edit SKU' : 'Add New SKU'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'sku', label: 'SKU *', full: false },
                  { key: 'product_name', label: 'Product Name *', full: true },
                  { key: 'brand_name', label: 'Brand Name', full: false },
                  { key: 'product_category', label: 'Product Category', full: false },
                  { key: 'product_gtin', label: 'Product GTIN', full: false },
                  { key: 'province', label: 'Province', full: false },
                  { key: 'stock_size', label: 'Stock Size (e.g. 4x2")', full: false },
                  { key: 'printer_profile', label: 'Printer Profile', full: false },
                  { key: 'file_location', label: 'File Location / Link', full: true },
                  { key: 'notes', label: 'Notes', full: true },
                ].map(f => (
                  <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={form[f.key] || ''}
                      onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand-400 transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Units per Pack</label>
                  <input
                    type="number"
                    value={form.units_per_pack || ''}
                    onChange={e => setForm((p: any) => ({ ...p, units_per_pack: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label Type</label>
                  <select
                    value={form.label_type || 'blank'}
                    onChange={e => setForm((p: any) => ({ ...p, label_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand-400 transition-colors bg-white"
                  >
                    {LABEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">File Source</label>
                  <select
                    value={form.file_source || 'sharepoint'}
                    onChange={e => setForm((p: any) => ({ ...p, file_source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand-400 transition-colors bg-white"
                  >
                    {FILE_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !form.sku || !form.product_name}
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add SKU'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
