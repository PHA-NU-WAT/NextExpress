module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/callBackend.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callBackend",
    ()=>callBackend,
    "handleApiAction",
    ()=>handleApiAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function handleApiAction(req, actionMap) {
    try {
        let action = null;
        let body = {};
        // ✅ แยกตาม method
        if (req.method === "GET") {
            const { searchParams } = new URL(req.url);
            action = searchParams.get("action");
            const obj = {};
            searchParams.forEach((v, k)=>obj[k] = v);
            body = obj;
        } else {
            // POST, PUT, PATCH, DELETE
            body = await req.json();
            action = body.action;
        }
        if (!action) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: "Missing action"
            }, {
                status: 400
            });
        }
        const handler = actionMap[action];
        if (!handler) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: `Unknown action: ${action}`
            }, {
                status: 400
            });
        }
        return await handler(body);
    } catch (err) {
        const e = err;
        const status = typeof e.status === "number" && e.status > 0 ? e.status : 500;
        const message = e.message || "เกิดข้อผิดพลาดในระบบ (ไม่สามารถประมวลผลคำขอนี้ได้)";
        console.error(`❌ handleApiAction error [${status}]:`, message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: true,
            code: e.code ?? "INTERNAL_ERROR",
            message
        }, {
            status
        });
    }
}
async function callBackend(endpoint, body, method = "POST") {
    const baseUrl = process.env.API_URL || "http://localhost:4000";
    const url = `${baseUrl}${endpoint}`;
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const cookieHeader = cookieStore.toString();
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader
        },
        body: method === "POST" && body ? JSON.stringify(body) : undefined,
        credentials: "include"
    };
    let res;
    try {
        res = await fetch(url, options);
    } catch (networkError) {
        throw {
            status: 0,
            code: "NETWORK_ERROR",
            message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
            details: networkError
        };
    }
    if (!res.ok) {
        const text = await res.text();
        try {
            const parsed = JSON.parse(text);
            throw {
                status: res.status,
                code: parsed.code ?? `HTTP_${res.status}`,
                message: parsed.message ?? `Backend error ${res.status}`,
                details: parsed.details
            };
        } catch  {
            throw {
                status: res.status,
                code: `HTTP_${res.status}`,
                message: text || `Backend error ${res.status}`
            };
        }
    }
    return await res.json();
}
}),
"[project]/src/app/api/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$callBackend$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/callBackend.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$callBackend$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callBackend"])("/api/login", body, "POST");
        // 🟢 สร้าง response object
        const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
        // 🟢 ถ้ามี token จาก Express → set cookie ใน domain ของ Next.js
        const token = result?.token;
        if (token) {
            res.cookies.set("authToken", token, {
                httpOnly: true,
                secure: ("TURBOPACK compile-time value", "development") === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7
            });
            console.log("🍪 Cookie set: authToken");
        } else {
            console.warn("⚠️ No token found in response from backend.");
        }
        return res;
    } catch (err) {
        console.error("❌ Login error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: "Login failed",
            details: err
        }, {
            status: 500
        });
    }
}
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        message: "Next.js → Express login proxy active ✅"
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5821db96._.js.map