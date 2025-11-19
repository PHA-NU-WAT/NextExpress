// ✅ บอก TypeScript ว่า ExperimentalConfig ของ Next.js มี allowedDevOrigins ด้วย
declare module "next" {
  interface ExperimentalConfig {
    allowedDevOrigins?: string[]
  }
}