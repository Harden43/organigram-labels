'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import AppLayout from '@/components/AppLayout'
import LabelPreview from '@/components/LabelPreview'
import { ExtractedData } from '@/lib/types'
import { getSession } from '@/lib/auth'
import { Upload, Loader2, CheckCircle, AlertTriangle, Printer, RotateCcw, ChevronRight, Tag } from 'lucide-react'
import clsx from 'clsx'

type Step = 'upload' | 'verify' | 'preview'
type LabelType = 'bs' | 'mc' | 'both'

const EMPTY: ExtractedData = {
  wop_number: '', product_name: '', brand_name: '', sku: '', province_sku: '',
  lot_number: '', formulation_lot: '', packaged_on_date: '', unit_size: '',
  units_per_pack: '', total_units: '', total_master_cases: '', province: '',
  product_gtin: '', case_gtin: '', thc: '', total_thc: '', cbd: '',
  total_cbd: '', product_category: '', net_weight: '', licensed_supplier: 'Organigram Inc.',
  descriptors_en: '', descriptors_fr: '', dried_equivalent: '',
}

const FIELD_SECTIONS = [
  {
    title: 'Work order',
    fields: [
      { key: 'wop_number', label: 'WOP / WO Number' },
      { key: 'lot_number', label: 'Lot Number', critical: true },
      { key: 'formulation_lot', label: 'Formulation Lot' },
      { key: 'packaged_on_date', label: 'Packaged On Date' },
      { key: 'total_units', label: 'Total Units' },
      { key: 'total_master_cases', label: 'Total Master Cases' },
      { key: 'units_per_pack', label: 'Units per Pack' },
    ],
  },
  {
    title: 'Product info',
    fields: [
      { key: 'product_name', label: 'Product Name' },
      { key: 'brand_name', label: 'Brand Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'province_sku', label: 'Province SKU' },
      { key: 'product_category', label: 'Product Category' },
      { key: 'unit_size', label: 'Unit Size (g)' },
      { key: 'net_weight', label: 'Net Weight (g)' },
      { key: 'dried_equivalent', label: 'Dried Equivalent (g)' },
      { key: 'descriptors_en', label: 'Descriptors EN' },
      { key: 'descriptors_fr', label: 'Descriptors FR' },
      { key: 'province', label: 'Province / Destination' },
    ],
  },
  {
    title: 'Potency — verify carefully ⚑',
    fields: [
      { key: 'thc', label: 'THC (mg/g)', critical: true },
      { key: 'total_thc', label: 'Total THC (mg/g)', critical: true },
      { key: 'cbd', label: 'CBD (mg/g)', critical: true },
      { key: 'total_cbd', label: 'Total CBD (mg/g)', critical: true },
    ],
  },
  {
    title: 'Barcodes & identifiers',
    fields: [
      { key: 'product_gtin', label: 'Product GTIN' },
      { key: 'case_gtin', label: 'Case GTIN' },
      { key: 'licensed_supplier', label: 'Licensed Supplier' },
    ],
  },
]

export default function GeneratePage() {
  const [step, setStep] = useState<Step>('upload')
  const [labelType, setLabelType] = useState<LabelType>('bs')
  const [woFile, setWoFile] = useState<{ b64: string; mime: string; name: string } | null>(null)
  const [specFile, setSpecFile] = useState<{ b64: string; mime: string; name: string } | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [fields, setFields] = useState<ExtractedData>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const woRef = useRef<HTMLInputElement>(null)
  const specRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function readFile(file: File): Promise<{ b64: string; mime: string; name: string }> {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target?.result as string
        res({ b64: result.split(',')[1], mime: file.type, name: file.name })
      }
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }

  async function handleWo(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setWoFile(await readFile(e.target.files[0]))
  }

  async function handleSpec(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setSpecFile(await readFile(e.target.files[0]))
  }

  async function extract() {
    if (!woFile || !specFile) return
    setExtracting(true)
    setExtractError('')
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ woImage: woFile.b64, specImage: specFile.b64, woMime: woFile.mime, specMime: specFile.mime }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      setFields({ ...EMPTY, ...data.data })
      setStep('verify')
    } catch (err: any) {
      setExtractError(err.message || 'Extraction failed. Try again.')
    }
    setExtracting(false)
  }

  async function saveAndPreview() {
    setStep('preview')
    setSaved(false)
    setSaving(true)
    try {
      const { user } = getSession()
      await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wo_number: fields.wop_number,
          sku: fields.sku,
          province_sku: fields.province_sku,
          product_name: fields.product_name,
          brand_name: fields.brand_name,
          lot_number: fields.lot_number,
          formulation_lot: fields.formulation_lot,
          packaged_on_date: fields.packaged_on_date,
          unit_size: fields.unit_size,
          units_per_pack: fields.units_per_pack,
          total_units: fields.total_units,
          total_master_cases: fields.total_master_cases,
          province: fields.province,
          product_gtin: fields.product_gtin,
          case_gtin: fields.case_gtin,
          thc: fields.thc,
          total_thc: fields.total_thc,
          cbd: fields.cbd,
          total_cbd: fields.total_cbd,
          product_category: fields.product_category,
          net_weight: fields.net_weight,
          label_type: labelType,
          printed_by: user,
          verified: true,
        }),
      })
      setSaved(true)
    } catch {}
    setSaving(false)
  }

  function printLabel() {
    // Build a clean filename: lot - sku - product - POD
    const sanitize = (s: string) => (s || '').replace(/[\\/:*?"<>|]/g, '').trim()
    const parts = [
      sanitize(fields.lot_number) || 'NO_LOT',
      sanitize(fields.province_sku || fields.sku) || 'NO_SKU',
      sanitize(fields.product_name) || 'NO_NAME',
      sanitize(fields.packaged_on_date) || 'NO_DATE',
    ]
    const filename = parts.join(' - ')

    const originalTitle = document.title
    document.title = filename
    window.print()
    // Restore title shortly after the dialog opens
    setTimeout(() => { document.title = originalTitle }, 1000)
  }

  function reset() {
    setStep('upload')
    setWoFile(null)
    setSpecFile(null)
    setFields({ ...EMPTY })
    setExtractError('')
    setSaved(false)
    if (woRef.current) woRef.current.value = ''
    if (specRef.current) specRef.current.value = ''
  }

  return (
    <AppLayout>
      {/* Print-only area — rendered as a portal directly into <body> so it can be visually isolated during print */}
      {mounted && createPortal(
        <div id="print-label-portal" style={{ display: 'none' }}>
          <LabelPreview data={fields} type={labelType} forPrint />
        </div>,
        document.body
      )}

      <div className="no-print p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Generate Label</h1>
            <p className="text-sm text-gray-500 mt-0.5">Upload WO + spec sheet to auto-generate print-ready labels</p>
          </div>
          {step !== 'upload' && (
            <button onClick={reset} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 transition-colors">
              <RotateCcw size={14} /> New WO
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(['upload', 'verify', 'preview'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                step === s ? 'bg-brand-500 text-white' :
                  (['upload', 'verify', 'preview'].indexOf(step) > i) ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-400'
              )}>
                {(['upload', 'verify', 'preview'].indexOf(step) > i)
                  ? <CheckCircle size={12} />
                  : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{i + 1}</span>
                }
                {s === 'upload' ? 'Upload' : s === 'verify' ? 'Verify' : 'Preview & Print'}
              </div>
              {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-5">

            {/* STEP 1: Upload */}
            {step === 'upload' && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-medium text-gray-900">Upload Screenshots</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Take screenshots from Veeva Vault and your spec sheet</p>
                </div>
                <div className="p-6 space-y-4">
                  {/* WO Upload */}
                  <div>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Work Order (from Veeva)</p>
                    {!woFile ? (
                      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 hover:border-brand-400 rounded-xl p-6 cursor-pointer transition-colors group">
                        <input ref={woRef} type="file" accept="image/*" className="hidden" onChange={handleWo} />
                        <Upload size={22} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
                        <p className="text-sm text-gray-500">Click to upload WO screenshot</p>
                        <p className="text-xs text-gray-400 font-mono">PNG · JPG</p>
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{woFile.name}</p>
                          <span className="text-[10px] font-mono bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Work Order</span>
                        </div>
                        <button onClick={() => setWoFile(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                      </div>
                    )}
                  </div>

                  {/* Spec Upload */}
                  <div>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Spec Sheet</p>
                    {!specFile ? (
                      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 hover:border-brand-400 rounded-xl p-6 cursor-pointer transition-colors group">
                        <input ref={specRef} type="file" accept="image/*" className="hidden" onChange={handleSpec} />
                        <Upload size={22} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
                        <p className="text-sm text-gray-500">Click to upload spec sheet screenshot</p>
                        <p className="text-xs text-gray-400 font-mono">PNG · JPG</p>
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <CheckCircle size={18} className="text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{specFile.name}</p>
                          <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Spec Sheet</span>
                        </div>
                        <button onClick={() => setSpecFile(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                      </div>
                    )}
                  </div>

                  {/* Label type */}
                  <div>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Label Type</p>
                    <div className="flex gap-2">
                      {(['bs', 'mc', 'both'] as LabelType[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setLabelType(t)}
                          className={clsx(
                            'px-4 py-2 rounded-lg text-xs font-mono border transition-colors',
                            labelType === t
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                          )}
                        >
                          {t === 'bs' ? 'Brightstock (BS)' : t === 'mc' ? 'Mastercase (MC)' : 'Both'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {extractError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                      {extractError}
                    </div>
                  )}

                  <button
                    onClick={extract}
                    disabled={!woFile || !specFile || extracting}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {extracting ? <><Loader2 size={16} className="animate-spin" /> Extracting data...</> : 'Extract data from screenshots →'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Verify fields */}
            {step === 'verify' && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-medium text-gray-900">Verify Extracted Data</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Fields marked ⚑ are critical — always double-check against your WO</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    Verify lot number and potency values match your WO exactly before proceeding.
                  </div>

                  {FIELD_SECTIONS.map(section => (
                    <div key={section.title}>
                      <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                        {section.title}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {section.fields.map(f => (
                          <div key={f.key} className={f.key === 'product_name' ? 'col-span-2' : ''}>
                            <label className="block text-[11px] text-gray-500 mb-1">
                              {f.label}{(f as any).critical ? ' ⚑' : ''}
                            </label>
                            <input
                              type="text"
                              value={(fields as any)[f.key] || ''}
                              onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                              className={clsx(
                                'w-full px-3 py-2 rounded-lg border text-sm transition-colors',
                                (f as any).critical
                                  ? 'border-brand-300 bg-brand-50 focus:border-brand-500'
                                  : 'border-gray-200 focus:border-brand-400'
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep('upload')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      ← Back
                    </button>
                    <button
                      onClick={saveAndPreview}
                      className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      Generate Label →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Actions */}
            {step === 'preview' && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-medium text-gray-900">Ready to Print</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    <strong>Final check:</strong>&nbsp;Confirm lot # and potency on the preview match your WO exactly before printing.
                  </div>

                  {saving && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 size={14} className="animate-spin" /> Saving to WO log...
                    </div>
                  )}
                  {saved && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle size={14} /> Saved to WO tracker
                    </div>
                  )}

                  <button
                    onClick={printLabel}
                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={16} /> Print Label
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setStep('verify')} className="py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      ← Edit Fields
                    </button>
                    <button onClick={reset} className="py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <RotateCcw size={13} /> New WO
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Label preview */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Label Preview</h2>
              <p className="text-xs text-gray-500 mt-0.5">Updates as you fill fields</p>
            </div>
            <div className="p-6">
              {step === 'upload' && fields.wop_number === '' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <Tag size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 font-mono">Upload screenshots to see<br />label preview here</p>
                </div>
              ) : (
                <LabelPreview data={fields} type={labelType} />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
