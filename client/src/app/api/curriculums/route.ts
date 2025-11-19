import { NextRequest, NextResponse } from "next/server"
import { callBackend, handleApiAction } from "@/lib/callBackend"

// ============================================
// 🧩 Action map — รวมฟังก์ชันทั้งหมด
// ============================================

async function FetchCurriculums(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/curriculums/curriculums/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}
async function FetchSubjects(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/curriculums/subjects/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}
async function EditCurriculums(body: unknown) {
  const result = await callBackend("/api/curriculums/edit", body, "POST")
  return NextResponse.json(result)
}






// 🚀 Route หลัก
export async function GET(req: NextRequest) {
  return handleApiAction(req, {
    FetchCurriculums,
    FetchSubjects
  })
}

export async function POST(req: NextRequest) {
  return handleApiAction(req, {
    EditCurriculums
  })
}
