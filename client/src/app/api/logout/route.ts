import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })
  res.cookies.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}

// 👀 ถ้าเป็น GET → ลบ cookie แล้ว redirect ไปหน้า login
export async function GET() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))

  res.cookies.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return res
}
