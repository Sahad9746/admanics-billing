import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('admanics-auth')
  
  // Verify cookie value (simple check, or use JWT in real app)
  // Here just checking existence essentially, or could verify a hash
  if (!authCookie || authCookie.value !== 'true') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
