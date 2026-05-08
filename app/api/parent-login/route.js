import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parents } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request) {
  const { phone, password } = await request.json()

  const [parent] = await db.select().from(parents)
    .where(eq(parents.phone, phone))

  if (!parent || parent.password !== password) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, student_id: parent.student_id })
  response.cookies.set('parent_session', String(parent.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax'
  })
  return response
}