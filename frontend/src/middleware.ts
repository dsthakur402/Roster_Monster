
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Temporarily disabled access control
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/staff/:path*",
    "/fte/:path*",
    "/locations/:path*",
    "/leave/:path*",
    "/roster/:path*",
    "/settings/:path*",
    "/subscription/:path*",
    "/auth/signin"
  ]
}
