import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    // Find user by token and check if it has not expired
    const user = await client.fetch(
      `*[_type == "user" && resetToken == $token && resetTokenExpires > $now][0]`,
      { token, now: new Date().toISOString() }
    )

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user and clear token
    await client
      .patch(user._id)
      .set({ password: hashedPassword })
      .unset(['resetToken', 'resetTokenExpires'])
      .commit()

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
