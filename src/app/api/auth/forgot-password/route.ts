import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    )

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000).toISOString() // 1 hour from now

    // Update user with token
    await client
      .patch(user._id)
      .set({
        resetToken: token,
        resetTokenExpires: expires,
      })
      .commit()

    // Send email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
