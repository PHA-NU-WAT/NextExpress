import { NextRequest, NextResponse } from "next/server"
import { callBackend } from "@/lib/callBackend"


export async function GET() {

  const result = await callBackend("/api/auth/profile", undefined, "GET")

  return NextResponse.json(result)
}
