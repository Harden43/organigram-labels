-- ============================================
-- ORGANIGRAM LABEL GENERATOR — DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Work Orders Log
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wo_number TEXT NOT NULL,
  sku TEXT,
  province_sku TEXT,
  product_name TEXT,
  brand_name TEXT,
  lot_number TEXT,
  formulation_lot TEXT,
  packaged_on_date TEXT,
  unit_size TEXT,
  units_per_pack TEXT,
  total_units TEXT,
  total_master_cases TEXT,
  province TEXT,
  product_gtin TEXT,
  case_gtin TEXT,
  thc TEXT,
  total_thc TEXT,
  cbd TEXT,
  total_cbd TEXT,
  product_category TEXT,
  net_weight TEXT,
  label_type TEXT CHECK (label_type IN ('bs', 'mc', 'both')),
  printed_by TEXT,
  verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  printed_at TIMESTAMPTZ
);

-- Mismatch Log
CREATE TABLE IF NOT EXISTS mismatches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wo_number TEXT NOT NULL,
  sku TEXT,
  product_name TEXT,
  field_name TEXT NOT NULL,
  wo_value TEXT,
  label_value TEXT,
  caught_by TEXT,
  caught_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT
);

-- SKU Master Table
CREATE TABLE IF NOT EXISTS skus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  brand_name TEXT,
  product_category TEXT,
  label_type TEXT CHECK (label_type IN ('blank', 'pre-printed', 'tube', 'pouch', 'bs', 'other')),
  stock_size TEXT,
  printer_profile TEXT,
  file_location TEXT,
  file_source TEXT CHECK (file_source IN ('sharepoint', 'dcm', 'both')),
  units_per_pack INTEGER,
  product_gtin TEXT,
  province TEXT,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wo_number ON work_orders(wo_number);
CREATE INDEX IF NOT EXISTS idx_wo_created ON work_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mismatch_wo ON mismatches(wo_number);
CREATE INDEX IF NOT EXISTS idx_mismatch_caught ON mismatches(caught_at DESC);
CREATE INDEX IF NOT EXISTS idx_sku ON skus(sku);

-- Row Level Security (basic — open for your small team)
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mismatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role (your API uses this)
CREATE POLICY "service_role_all_wo" ON work_orders FOR ALL USING (true);
CREATE POLICY "service_role_all_mm" ON mismatches FOR ALL USING (true);
CREATE POLICY "service_role_all_sku" ON skus FOR ALL USING (true);

-- Sample SKU data (edit to match your real SKUs)
INSERT INTO skus (sku, product_name, brand_name, product_category, label_type, units_per_pack, file_source, active)
VALUES
  ('302522_0.95g', 'Trippy Sips Watermelon Drip VLD 0.95g', 'Trippy Sips', 'Vape Liquid Diamond', 'tube', 12, 'dcm', true),
  ('302517_1g', 'Boxhot Ruby Rush VLA 1g', 'Boxhot', 'Vape Liquid AIO', 'pre-printed', 12, 'sharepoint', true)
ON CONFLICT (sku) DO NOTHING;
