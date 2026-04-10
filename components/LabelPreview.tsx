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

function BSLabel({ data }: { data: ExtractedData }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
        Brightstock label · {data.wop_number}
      </p>
      <div
        id="bs-label"
        style={{
          background: '#fff',
          border: '1.5px solid #1a1a18',
          borderRadius: '4px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#000',
          padding: '10px 12px',
          maxWidth: '380px',
          fontSize: '11px',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '7px', marginBottom: '7px', borderBottom: '1px solid #ccc' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.2 }}>{data.product_name || '—'}</div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
              {data.brand_name || '—'} · {data.product_category || '—'}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#444', lineHeight: 1.7 }}>
            SKU: <strong>{data.sku || '—'}</strong><br />
            Unit: <strong>{data.unit_size || '—'} g</strong>
          </div>
        </div>

        {/* Potency */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', paddingBottom: '7px', marginBottom: '7px', borderBottom: '1px solid #ccc', fontSize: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>THC</span>
            <strong style={{ fontSize: '11px' }}>{data.thc || '—'} mg/g</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Total THC</span>
            <strong style={{ fontSize: '11px' }}>{data.total_thc || '—'} mg/g</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>CBD</span>
            <strong style={{ fontSize: '11px' }}>{data.cbd || '—'} mg/g</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Total CBD</span>
            <strong style={{ fontSize: '11px' }}>{data.total_cbd || '—'} mg/g</strong>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', fontSize: '10px' }}>
          <div>
            <div style={{ color: '#666', fontSize: '9px' }}>Lot #</div>
            <div style={{ fontWeight: 700, fontSize: '11px' }}>{data.lot_number || '—'}</div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '9px' }}>Packaged on</div>
            <div style={{ fontWeight: 700, fontSize: '11px' }}>{data.packaged_on_date || '—'}</div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '9px' }}>Province</div>
            <div style={{ fontWeight: 700, fontSize: '11px' }}>{data.province || '—'}</div>
          </div>
        </div>

        {/* GTIN bar */}
        <div style={{ marginTop: '7px', paddingTop: '6px', borderTop: '1px solid #ccc', fontSize: '9px', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
          <span>GTIN: {data.product_gtin || '—'}</span>
          <span>{data.licensed_supplier || 'Organigram Inc.'}</span>
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
