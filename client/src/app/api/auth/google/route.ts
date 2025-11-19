import { NextResponse } from "next/server";

export async function GET() {
  const redirect_uri = "https://core.pcshs.online/api/auth/google/callback";
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri, // ไม่ต้อง encode ซ้ำ
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
