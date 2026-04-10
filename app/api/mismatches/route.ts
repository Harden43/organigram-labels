import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items = Array.isArray(body) ? body : [body]
    const { data, error } = await supabaseAdmin
      .from('mismatches')
      .insert(items.map(i => ({ ...i, caught_at: new Date().toISOString() })))
      .select()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const resolved = searchParams.get('resolved')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('mismatches')
      .select('*', { count: 'exact' })
      .order('caught_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (resolved === 'false') query = query.eq('resolved', false)
    if (resolved === 'true') query = query.eq('resolved', true)

    const { data, error, count } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, data, count })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, resolved, resolved_by, notes } = await req.json()
    const { data, error } = await supabaseAdmin
      .from('mismatches')
      .update({
        resolved,
        resolved_by,
        notes,
        resolved_at: resolved ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
