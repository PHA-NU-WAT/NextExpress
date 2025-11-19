import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export interface BackendError {
  status: number
  code?: string
  message: string
  details?: unknown
}

// ===========================================
// 🧠 handleApiAction — ใช้ใน Next API routes
// ===========================================
export async function handleApiAction(
  req: NextRequest,
  actionMap: Record<string, (body: unknown) => Promise<NextResponse>>
): Promise<NextResponse> {
  try {
    let action: string | null = null
    let body: unknown = {}

    // ✅ แยกตาม method
    if (req.method === "GET") {
      const { searchParams } = new URL(req.url)
      action = searchParams.get("action")
      const obj: Record<string, string> = {}
      searchParams.forEach((v, k) => (obj[k] = v))
      body = obj
    } else {
      // POST, PUT, PATCH, DELETE
      body = await req.json()
      action = (body as Record<string, unknown>).action as string
    }

    if (!action) {
      return NextResponse.json({ error: true, message: "Missing action" }, { status: 400 })
    }

    const handler = actionMap[action]
    if (!handler) {
      return NextResponse.json({ error: true, message: `Unknown action: ${action}` }, { status: 400 })
    }

    return await handler(body)
  } catch (err) {
    const e = err as Partial<BackendError>
    const status = typeof e.status === "number" && e.status > 0 ? e.status : 500
    const message = e.message || "เกิดข้อผิดพลาดในระบบ (ไม่สามารถประมวลผลคำขอนี้ได้)"
    console.error(`❌ handleApiAction error [${status}]:`, message)
    return NextResponse.json(
      { error: true, code: e.code ?? "INTERNAL_ERROR", message },
      { status }
    )
  }
}

// ===========================================
// 🔧 callBackend — ส่งต่อไปยัง Express backend
// ===========================================
export async function callBackend<T>(
  endpoint: string,
  body?: unknown,
  method: "POST" | "GET" = "POST"
): Promise<T> {
  const baseUrl = process.env.API_URL || "http://localhost:4000"
  const url = `${baseUrl}${endpoint}`

  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: method === "POST" && body ? JSON.stringify(body) : undefined,
    credentials: "include",
  }

  let res: Response
  try {
    res = await fetch(url, options)
  } catch (networkError) {
    throw {
      status: 0,
      code: "NETWORK_ERROR",
      message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      details: networkError,
    } satisfies BackendError
  }

  if (!res.ok) {
    const text = await res.text()
    try {
      const parsed = JSON.parse(text)
      throw {
        status: res.status,
        code: parsed.code ?? `HTTP_${res.status}`,
        message: parsed.message ?? `Backend error ${res.status}`,
        details: parsed.details,
      } satisfies BackendError
    } catch {
      throw {
        status: res.status,
        code: `HTTP_${res.status}`,
        message: text || `Backend error ${res.status}`,
      } satisfies BackendError
    }
  }

  return (await res.json()) as T
}

