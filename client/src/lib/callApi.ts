export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  unauthorized?: boolean
}

export async function callApi<T>(
  endpoint: string,
  body?: Record<string, unknown>,
  method: "GET" | "POST" = "POST"
): Promise<ApiResponse<T>> {
  try {
    // ✅ ถ้าเป็น GET → แปลง body เป็น query string
    if (method === "GET" && body) {
      // ถ้ามี key data → flatten data ขึ้นมา
      const querySource =
        body.data && typeof body.data === "object"
          ? { ...body, ...body.data }
          : body

      const params = new URLSearchParams(
        Object.entries(querySource).reduce((acc, [k, v]) => {
          // ไม่ต้องใส่ key data ลงไป
          if (k === "data") return acc
          acc[k] = String(v ?? "")
          return acc
        }, {} as Record<string, string>)
      ).toString()

      endpoint += `?${params}`
    }

    
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(body) : undefined,
      credentials: "include",
      cache: "no-store",
    })
    
    const data = await res.json().catch(() => ({}))
    const message = data.message || `เกิดข้อผิดพลาดในระบบ (${res.status})`

    if (res.status === 401) {
      return { success: false, message, unauthorized: true }
    }

    if (!res.ok) {
      return { success: false, message }
    }

    return {
      success: true,
      message: data.message || "ดำเนินการสำเร็จ",
      data,
    }
  } catch (err) {
    console.error("❌ callApi error:", err)
    return {
      success: false,
      message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
    }
  }
}

