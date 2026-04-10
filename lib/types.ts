export interface WorkOrder {
  id?: string
  wo_number: string
  sku: string
  province_sku?: string
  product_name: string
  brand_name?: string
  lot_number: string
  formulation_lot?: string
  packaged_on_date?: string
  unit_size?: string
  units_per_pack?: string
  total_units?: string
  total_master_cases?: string
  province?: string
  product_gtin?: string
  case_gtin?: string
  thc?: string
  total_thc?: string
  cbd?: string
  total_cbd?: string
  product_category?: string
  net_weight?: string
  label_type: 'bs' | 'mc' | 'both'
  printed_by?: string
  verified?: boolean
  notes?: string
  created_at?: string
  printed_at?: string
}

export interface Mismatch {
  id?: string
  wo_number: string
  sku?: string
  product_name?: string
  field_name: string
  wo_value?: string
  label_value?: string
  caught_by?: string
  caught_at?: string
  resolved?: boolean
  resolved_at?: string
  resolved_by?: string
  notes?: string
}

export interface SKU {
  id?: string
  sku: string
  product_name: string
  brand_name?: string
  product_category?: string
  label_type?: string
  stock_size?: string
  printer_profile?: string
  file_location?: string
  file_source?: 'sharepoint' | 'dcm' | 'both'
  units_per_pack?: number
  product_gtin?: string
  province?: string
  active?: boolean
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ExtractedData {
  wop_number: string
  product_name: string
  brand_name: string
  sku: string
  province_sku: string
  lot_number: string
  formulation_lot: string
  packaged_on_date: string
  unit_size: string
  units_per_pack: string
  total_units: string
  total_master_cases: string
  province: string
  product_gtin: string
  case_gtin: string
  thc: string
  total_thc: string
  cbd: string
  total_cbd: string
  product_category: string
  net_weight: string
  licensed_supplier: string
  descriptors_en: string
  descriptors_fr: string
  dried_equivalent: string
}

export interface User {
  name: string
  pin: string
}
