import { NextRequest, NextResponse } from "next/server"
import { callBackend, handleApiAction } from "@/lib/callBackend"

// ============================================
// 🧩 Action map — รวมฟังก์ชันทั้งหมด
// ============================================

async function FetchStudents(body: unknown) {
  console.log("FetchStudents body:", body)
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/students/fetch?${qs}`, body, "GET")
  return NextResponse.json(result) // ✅ แก้จาก Response → NextResponse
}

async function EditStudent(body: unknown) {
  const result = await callBackend("/api/students/edit", body, "POST")
  return NextResponse.json(result)
}

// 🚀 Route หลัก
export async function GET(req: NextRequest) {
  return handleApiAction(req, {
    FetchStudents
  })
}

export async function POST(req: NextRequest) {
  return handleApiAction(req, {
    EditStudent
  })
}
