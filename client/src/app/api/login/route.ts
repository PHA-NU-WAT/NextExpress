import { NextRequest, NextResponse } from "next/server"
import { callBackend } from "@/lib/callBackend"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await callBackend("/api/login", body, "POST")
    
    // 🟢 สร้าง response object
    const res = NextResponse.json(result)

    // 🟢 ถ้ามี token จาก Express → set cookie ใน domain ของ Next.js
    const token = (result as any)?.token
    if (token) {
      res.cookies.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 วัน
      })
      console.log("🍪 Cookie set: authToken")
    } else {
      console.warn("⚠️ No token found in response from backend.")
    }

    return res
  } catch (err) {
    console.error("❌ Login error:", err)
    return NextResponse.json(
      { success: false, message: "Login failed", details: err },
      { status: 500 }
    )
  }
}

// ✅ ทดสอบ GET /api/login
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Next.js → Express login proxy active ✅",
  })
}
