import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function proxy(req: NextRequest) {

  const { pathname, search } = req.nextUrl
  const token = req.cookies.get("authToken")?.value

  // ✅ ข้าม path ที่ไม่ต้องตรวจ token
  const skipPattern = /^\/api\/(login|logout|auth(?:\/.*)?)$/i;


  if (skipPattern.test(pathname)) {
    return NextResponse.next()
  }

  const isApi = pathname.startsWith("/api/")

  // ✅ ฟังก์ชันสร้าง URL redirect พร้อม path เดิม
  const buildLoginRedirect = () => {
    const loginUrl = new URL("/login", req.url)
    // รวม path + query string เดิม
    const fullPath = pathname + (search || "")
    loginUrl.searchParams.set("redirect", fullPath)
    return loginUrl
  }

  // ❌ ไม่มี token
  if (!token) {
    if (isApi) {
      return NextResponse.json(
        {
          success: false,
          code: "Unauthorized",
          message: "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
          path: pathname, // บอกว่า API ไหนโดน
        },
        { status: 401 }
      )
    }
    return NextResponse.redirect(buildLoginRedirect())
  }

  try {
    // ✅ ตรวจสอบ JWT
    const secretKey = process.env.JWT_SECRET
    if (!secretKey) throw new Error("Missing JWT_SECRET")

    const secret = new TextEncoder().encode(secretKey)
    const { payload } = await jwtVerify(token, secret)

    // ✅ ตรวจวันหมดอายุ
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error("Token expired")
    }

    return NextResponse.next()
  } catch (error) {
    console.warn("⚠️ Invalid or expired token:", error)

    // ลบ cookie กัน loop
    const response = isApi
      ? NextResponse.json(
        {
          success: false,
          code: "Unauthorized",
          message: "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
          path: pathname,
        },
        { status: 401 }
      )
      : NextResponse.redirect(buildLoginRedirect())

    response.cookies.delete("authToken")
    return response
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/personnel/:path*",
    "/register/:path*",
    "/curriculums/:path*",
    "/enroll/:path*",
    "/evaluation/:path*",
    "/salary/:path*",
    "/profile/:path*",
  ],
}
