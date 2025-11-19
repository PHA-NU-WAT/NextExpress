// app/api/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "✅ API server is running",
    timestamp: new Date().toISOString(),
  })
}
