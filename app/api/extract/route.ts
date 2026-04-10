import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { woImage, specImage, woMime, specMime } = body

    if (!woImage || !specImage) {
      return NextResponse.json({ error: 'Both WO and spec sheet images are required' }, { status: 400 })
    }

    const prompt = `You are a cannabis labelling assistant at Organigram Inc. in Canada.
You are given two images:
1. A Work Order (WO) from Veeva Vault — contains the WO number (starts with "WO" e.g. WO00024495)
2. A Product Specification Sheet — contains the actual Lot Number

CRITICAL DISTINCTIONS — DO NOT CONFUSE THESE FIELDS:
- wop_number: The Work Order number, ALWAYS starts with "WO" (e.g., "WO00024495"). Found on the Work Order image. Goes in wop_number ONLY.
- lot_number: A purely numeric batch/lot identifier (e.g., "46623260124"). Found on the SPEC SHEET in a row labeled "Lot Number" or "Lot #". NEVER starts with "WO". NEVER use the WO number as the lot number.

If you cannot find a separate numeric Lot Number on the spec sheet, return an empty string for lot_number — do NOT fall back to the WO number.

Extract every label-relevant field from both images carefully.
Pay special attention to:
- Potency values: THC, Total THC, CBD, Total CBD (number only, no units)
- Packaged on date (YYYY-MM-DD format if possible)
- SKU and Province SKU
- GTIN numbers (digits only)
- Strain descriptors (e.g. "Tropical, Sour, Gas") in both English and French if available
- Dried cannabis equivalent if listed (e.g. "4 g of dried cannabis")

For numeric potency values, return only the number (e.g. "925" not "925 mg/g").

Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON.

{
  "wop_number": "",
  "product_name": "",
  "brand_name": "",
  "sku": "",
  "province_sku": "",
  "lot_number": "",
  "formulation_lot": "",
  "packaged_on_date": "",
  "unit_size": "",
  "units_per_pack": "",
  "total_units": "",
  "total_master_cases": "",
  "province": "",
  "product_gtin": "",
  "case_gtin": "",
  "thc": "",
  "total_thc": "",
  "cbd": "",
  "total_cbd": "",
  "product_category": "",
  "net_weight": "",
  "descriptors_en": "",
  "descriptors_fr": "",
  "dried_equivalent": "",
  "licensed_supplier": "Organigram Inc."
}`

    // Fallback chain — if a model is overloaded (503) or not found (404), try the next one
    const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.0-flash']
    const parts = [
      { inlineData: { mimeType: woMime, data: woImage } },
      { inlineData: { mimeType: specMime, data: specImage } },
      { text: prompt },
    ]

    let text = ''
    let lastErr: any = null
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(parts)
        text = result.response.text()
        break
      } catch (e: any) {
        lastErr = e
        const msg = String(e?.message || e)
        // Only fall through on overload / not-found / quota errors
        if (!/503|overload|unavailable|404|not found|429|quota/i.test(msg)) {
          throw e
        }
        console.warn(`Model ${modelName} failed (${msg.slice(0, 120)}), trying next...`)
      }
    }

    if (!text) {
      throw lastErr || new Error('All Gemini models are unavailable. Try again in a moment.')
    }
    const clean = text.replace(/```json|```/g, '').trim()

    let extracted
    try {
      extracted = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid data. Please try again with clearer screenshots.' }, { status: 422 })
    }

    return NextResponse.json({ ok: true, data: extracted })
  } catch (err: any) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: err.message || 'Extraction failed' }, { status: 500 })
  }
}
