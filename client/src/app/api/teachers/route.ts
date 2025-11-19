import { NextRequest, NextResponse } from "next/server"
import { callBackend, handleApiAction } from "@/lib/callBackend"

// ============================================
// 🧩 Action map — รวมฟังก์ชันทั้งหมด
// ============================================

async function FetchTeachers(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/teachers/fetch?${qs}`, body, "GET")
  return NextResponse.json(result) // ✅ แก้จาก Response → NextResponse
}

// 🚀 Route หลัก
export async function GET(req: NextRequest) {
  return handleApiAction(req, {
    FetchTeachers
  })
}

export async function POST(req: NextRequest) {
  return handleApiAction(req, {

  })
}
