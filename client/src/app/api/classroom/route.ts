import { NextRequest, NextResponse } from "next/server"
import { callBackend, handleApiAction } from "@/lib/callBackend"

// ============================================
// 🧩 Action map — รวมฟังก์ชันทั้งหมด
// ============================================

async function ClassroomAssign(body: unknown) {
  const result = await callBackend("/api/classroom/assign", body, "POST")
  return NextResponse.json(result) // ✅ แก้จาก Response → NextResponse
}

async function CancelClassroomAssign(body: unknown) {
  const result = await callBackend("/api/classroom/cancel", body, "POST")
  return NextResponse.json(result)
}

async function SeatNoAssign(body: unknown) {
  const result = await callBackend("/api/classroom/seat/assign", body, "POST")
  return NextResponse.json(result)
}

async function CancelSeatNoAssign(body: unknown) {
  const result = await callBackend("/api/classroom/seat/cancel", body, "POST")
  return NextResponse.json(result)
}

async function StudentPromotion(body: unknown) {
  const result = await callBackend("/api/classroom/promotion", body, "POST")
  return NextResponse.json(result)
}

async function DeleteStudent(body: unknown) {
  const result = await callBackend("/api/classroom/delete", body, "POST")
  return NextResponse.json(result)
}


// 🚀 Route หลัก
export async function POST(req: NextRequest) {
  return handleApiAction(req, {
    ClassroomAssign,
    CancelClassroomAssign,
    SeatNoAssign,
    CancelSeatNoAssign,
    StudentPromotion,
    DeleteStudent
  })
}
