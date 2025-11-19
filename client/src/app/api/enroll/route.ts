import { NextRequest, NextResponse } from "next/server"
import { callBackend, handleApiAction } from "@/lib/callBackend"

// ============================================
// 🧩 Action map — รวมฟังก์ชันทั้งหมด
// ============================================

async function FetchConfig(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/enroll/config/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}

async function FetchManageSubjects(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/enroll/manage/subjects/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}
async function FetchManageSections(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/enroll/manage/section/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}
async function FetchManageSectionsTeachers(body: unknown) {
  const query = body as Record<string, string>
  const qs = new URLSearchParams(query).toString()
  const result = await callBackend(`/api/enroll/manage/sectionTeacher/fetch?${qs}`, body, "GET")
  return NextResponse.json(result)
}



async function AssignConfig(body: unknown) {
  const result = await callBackend("/api/enroll/config/assign", body, "POST")
  return NextResponse.json(result)
}

async function CancelConfig(body: unknown) {
  const result = await callBackend("/api/enroll/config/cancel", body, "POST")
  return NextResponse.json(result)
}
async function EditConfig(body: unknown) {
  const result = await callBackend("/api/enroll/config/edit", body, "POST")
  return NextResponse.json(result)
}

async function AssignConfigMaxAddCr2(body: unknown) {
  const result = await callBackend("/api/enroll/config/assign/maxaAddCr2", body, "POST")
  return NextResponse.json(result)
}
async function EditConfigMaxAddCr2(body: unknown) {
  const result = await callBackend("/api/enroll/config/edit/maxaAddCr2", body, "POST")
  return NextResponse.json(result)
}
async function CancelConfigMaxAddCr2(body: unknown) {
  const result = await callBackend("/api/enroll/config/cancel/maxaAddCr2", body, "POST")
  return NextResponse.json(result)
}

async function ToggleOpenEnroll(body: unknown) {
  const result = await callBackend("/api/enroll/config/open/enroll", body, "POST")
  return NextResponse.json(result)
}

async function ToggleOpenSubject(body: unknown) {
  const result = await callBackend("/api/enroll/manage/open/subject", body, "POST")
  return NextResponse.json(result)
}


// 🚀 Route หลัก
export async function GET(req: NextRequest) {
  return handleApiAction(req, {
    FetchConfig,
    FetchManageSubjects,
    FetchManageSections,
    FetchManageSectionsTeachers
  })
}

export async function POST(req: NextRequest) {
  return handleApiAction(req, {
    AssignConfig,
    CancelConfig,
    EditConfig,
    AssignConfigMaxAddCr2,
    EditConfigMaxAddCr2,
    CancelConfigMaxAddCr2,
    ToggleOpenEnroll,
    ToggleOpenSubject
  })
}
