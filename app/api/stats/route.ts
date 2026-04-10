import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { startOfDay, startOfWeek } from 'date-fns'

export async function GET() {
  try {
    const todayStart = startOfDay(new Date()).toISOString()
    const weekStart = startOfWeek(new Date()).toISOString()

    const [todayRes, weekRes, mmRes, unresolvedRes, recentWOs, recentMM] = await Promise.all([
      supabaseAdmin.from('work_orders').select('id', { count: 'exact' }).gte('created_at', todayStart),
      supabaseAdmin.from('work_orders').select('id', { count: 'exact' }).gte('created_at', weekStart),
      supabaseAdmin.from('mismatches').select('id', { count: 'exact' }),
      supabaseAdmin.from('mismatches').select('id', { count: 'exact' }).eq('resolved', false),
      supabaseAdmin.from('work_orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('mismatches').select('*').order('caught_at', { ascending: false }).limit(5),
    ])

    return NextResponse.json({
      todayWOs: todayRes.count ?? 0,
      weekWOs: weekRes.count ?? 0,
      totalMismatches: mmRes.count ?? 0,
      unresolvedMismatches: unresolvedRes.count ?? 0,
      recentWOs: recentWOs.data ?? [],
      recentMismatches: recentMM.data ?? [],
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
