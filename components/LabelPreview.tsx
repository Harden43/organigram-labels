'use client'
import { useEffect, useRef } from 'react'
import bwipjs from 'bwip-js'
import { ExtractedData } from '@/lib/types'

interface LabelPreviewProps {
  data: ExtractedData
  type: 'bs' | 'mc' | 'both'
  forPrint?: boolean
}

export default function LabelPreview({ data, type, forPrint = false }: LabelPreviewProps) {
  return (
    <div className={forPrint ? 'print-page' : ''}>
      {(type === 'bs' || type === 'both') && <BSLabel data={data} />}
      {(type === 'mc' || type === 'both') && <MCLabel data={data} />}
    </div>
  )
}

function DataMatrix({ gtin, dateYYMMDD, lot, size = 90 }: { gtin: string; dateYYMMDD: string; lot: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (!gtin || !lot || !dateYYMMDD || dateYYMMDD === 'YYMMDD') return

    const gtin14 = gtin.replace(/\D/g, '').padStart(14, '0').slice(-14)
    const text = `(01)${gtin14}(13)${dateYYMMDD}(10)${lot}`

    try {
      ;(bwipjs as any).toCanvas(canvasRef.current, {
        bcid: 'gs1datamatrix',
        text,
        scale: 4,
        padding: 4,
      })
    } catch (e) {
      console.error('DataMatrix render failed:', e, 'text:', text)
    }
  }, [gtin, dateYYMMDD, lot])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px`, display: 'block' }}
    />
  )
}

function BSLabel({ data }: { data: ExtractedData }) {
  const BLACK = '#000'
  const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif'

  // Format date as YYMMDD for GS1 (13) barcode segment
  const dateForBarcode = (() => {
    if (!data.packaged_on_date) return 'YYMMDD'
    const m = data.packaged_on_date.match(/(\d{4})-?(\d{2})-?(\d{2})/)
    return m ? `${m[1].slice(2)}${m[2]}${m[3]}` : 'YYMMDD'
  })()

  const totalThc = data.total_thc || data.thc || '000.0'
  const totalCbd = data.total_cbd || data.cbd || '000.0'
  const dried = data.dried_equivalent || data.net_weight || 'X'
  const netWeight = data.net_weight || data.unit_size || 'X.X'

  return (
    <div className="mb-5">
      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
        Brightstock label · {data.wop_number}
      </p>
      <div
        style={{
          background: '#fff',
          border: '1px solid #d4d4cf',
          borderRadius: '4px',
          fontFamily: FONT,
          color: BLACK,
          padding: '20px 22px',
          maxWidth: '520px',
          fontSize: '11px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* LEFT: Variable imprint text */}
        <div>
          {/* Product name */}
          <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.2px', marginBottom: '4px' }}>
            {(data.product_name || 'PRODUCT NAME').toUpperCase()}
          </div>

          {/* Descriptors (bilingual) */}
          <div style={{ fontSize: '10px', marginBottom: '10px', lineHeight: 1.3 }}>
            {data.descriptors_en || '—'}{'  //  '}<em>{data.descriptors_fr || '—'}</em>
          </div>

          {/* Potency */}
          <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.5 }}>
            <div>Total THC Total: {totalThc} mg/g</div>
            <div>Total CBD Total: {totalCbd} mg/g</div>
          </div>

          {/* Dried equivalent */}
          <div style={{ fontSize: '10px', marginTop: '10px', lineHeight: 1.3 }}>
            <div>Contains the equivalent of {dried} g of dried cannabis</div>
            <div><em>Contient l&apos;équivalent de {dried} g de cannabis séché</em></div>
          </div>

          {/* Net weight */}
          <div style={{ fontSize: '10px', marginTop: '6px' }}>
            Net weight / <em>Poids net</em> : {netWeight} g
          </div>

          {/* Packaged on */}
          <div style={{ fontSize: '10px', marginTop: '6px' }}>
            Packaged on / <em>Emballé le</em> : {data.packaged_on_date || 'YYYY-MM-DD'}
          </div>

          {/* Lot */}
          <div style={{ fontSize: '10px' }}>
            Lot: {data.lot_number || 'XXXXXXXXXXX'}
          </div>
        </div>

        {/* RIGHT: Real DataMatrix + GS1 segments */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
          <DataMatrix
            gtin={data.product_gtin}
            dateYYMMDD={dateForBarcode}
            lot={data.lot_number}
          />
          <div style={{ fontSize: '10px', fontWeight: 600, lineHeight: 1.4 }}>
            <div>(01){data.product_gtin || '—'}</div>
            <div>(13){dateForBarcode}</div>
            <div>(10){data.lot_number || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MCLabel({ data }: { data: ExtractedData }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
        Mastercase label · {data.wop_number}
      </p>
      <div
        id="mc-label"
        style={{
          background: '#fff',
          border: '2px solid #111',
          borderRadius: '4px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#000',
          overflow: 'hidden',
          maxWidth: '480px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1.5px solid #222' }}>
          {[
            { label: 'Licensed Supplier', val: data.licensed_supplier || 'Organigram Inc.' },
            { label: 'Destination', val: data.province || '—' },
            { label: 'Product GTIN', val: data.product_gtin || '—' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '7px 10px', borderRight: i < 2 ? '1px solid #ccc' : 'none', textAlign: i === 2 ? 'right' : i === 1 ? 'center' : 'left' }}>
              <div style={{ color: '#666', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{f.label}</div>
              <div style={{ fontWeight: 700, fontSize: '11px' }}>{f.val}</div>
            </div>
          ))}
        </div>

        {/* Brand + Product */}
        <div style={{ textAlign: 'center', padding: '8px 10px', borderBottom: '1px solid #ccc' }}>
          <div style={{ fontSize: '8px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Brand Name</div>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>{data.brand_name || '—'}</div>
          <div style={{ fontSize: '8px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Product Name</div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{data.product_name || '—'}</div>
        </div>

        {/* Mid row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #ccc' }}>
          {[
            { label: 'Product Category', val: data.product_category || '—' },
            { label: 'Unit Size', val: `${data.unit_size || '—'} g` },
            { label: 'Units per case', val: data.units_per_pack || '—' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '7px 10px', borderRight: i < 2 ? '1px solid #ccc' : 'none', textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{f.label}</div>
              <div style={{ fontWeight: 700, fontSize: '11px' }}>{f.val}</div>
            </div>
          ))}
        </div>

        {/* Lot / SKU / Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #ccc' }}>
          <div style={{ padding: '7px 10px', borderRight: '1px solid #ccc' }}>
            <div style={{ fontSize: '8px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>No Lot / Lot #</div>
            <div style={{ fontWeight: 700, fontSize: '11px' }}>{data.lot_number || '—'}</div>
          </div>
          <div style={{ padding: '7px 10px', borderRight: '1px solid #ccc', textAlign: 'center' }}>
            <div style={{ fontSize: '8px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>SKU</div>
            <div style={{ fontWeight: 700, fontSize: '11px' }}>{data.province_sku || data.sku || '—'}</div>
          </div>
          <div style={{ padding: '7px 10px', textAlign: 'right' }}>
            <div style={{ fontSize: '8px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Packaging Date</div>
            <div style={{ fontWeight: 700, fontSize: '11px' }}>{data.packaged_on_date || '—'}</div>
          </div>
        </div>

        {/* Footer bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', fontSize: '9px', color: '#555', background: '#f8f8f8' }}>
          <span>Case GTIN: {data.case_gtin || '—'}</span>
          <span>Total MC: {data.total_master_cases || '—'}</span>
          <span>Units/case: {data.units_per_pack || '—'}</span>
          <span>Total units: {data.total_units || '—'}</span>
        </div>
      </div>
    </div>
  )
}
