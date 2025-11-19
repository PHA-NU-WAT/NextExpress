import { NextRequest, NextResponse } from "next/server"
import { callBackend, handleApiAction } from "@/lib/callBackend"

// ============================================
// 🧩 Action map — รวมฟังก์ชันทั้งหมด
// ============================================

async function FetchScore(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/evaluation/score/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}

async function SaveScore(body: unknown) {
  const result = await callBackend("/api/evaluation/score/save", body, "POST")
  return NextResponse.json(result) // ✅ แก้จาก Response → NextResponse
}


export async function GET(req: NextRequest) {
  return handleApiAction(req, {
    FetchScore
  })
}
export async function POST(req: NextRequest) {
  return handleApiAction(req, {
    SaveScore
  })
}
