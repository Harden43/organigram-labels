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
1. A Work Order (WO) from Veeva Vault
2. A Product Specification Sheet

Extract every label-relevant field from both images carefully.
Pay special attention to:
- Lot number (exactly as written)
- Potency values: THC, Total THC, CBD, Total CBD (include units mg/g)
- Packaged on date
- SKU and Province SKU
- GTIN numbers

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
  "licensed_supplier": "Organigram Inc."
}`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      {
        inlineData: { mimeType: woMime, data: woImage },
      },
      {
        inlineData: { mimeType: specMime, data: specImage },
      },
      { text: prompt },
    ])

    const text = result.response.text()
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
