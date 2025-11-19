import { NextRequest, NextResponse } from "next/server"
import { callBackend, handleApiAction } from "@/lib/callBackend"

async function FetchStudentsPublic(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/students/public/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}


// 🚀 Route หลัก
export async function GET(req: NextRequest) {
  return handleApiAction(req, {
    FetchStudentsPublic
  })
}

export async function POST(req: NextRequest) {
  return handleApiAction(req, {

  })
}
