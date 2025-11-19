// ✅ เพิ่ม field allowedDevOrigins เข้าไปใน ExperimentalConfig ของ Next.js
declare module "next/dist/server/config-shared" {
  interface ExperimentalConfig {
    allowedDevOrigins?: string[]
  }
}
