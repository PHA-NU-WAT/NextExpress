import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=missing_code`);
    }

    // 🔹 แลก code เป็น token จาก Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: "authorization_code",
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
        }),
    });

    const tokenJson = await tokenRes.json();

    if (!tokenJson.id_token) {
        console.error("❌ Token exchange failed", tokenJson);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=token_failed`);
    }

    // 🔹 ส่ง id_token ไปให้ Express ตรวจสอบ
    const verifyRes = await fetch(`${process.env.API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: tokenJson.id_token }),
    });

    const result = await verifyRes.json();

    if (!result.success) {
        console.error("❌ Backend error:", result);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=backend_reject`);
    }

    // ✅ redirect ไปหน้า /portal หรือหน้าอื่น ๆ โดยใช้ BASE_URL
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}`;
    
    const res = NextResponse.redirect(redirectUrl);
    
    res.cookies.set("authToken", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 วัน
    })
    
    return res;
}
