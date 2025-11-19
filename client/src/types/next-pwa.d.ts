declare module "next-pwa/cache.js" {
  interface RuntimeCachingRule {
    urlPattern: RegExp | string
    handler: string
    options?: Record<string, unknown>
  }

  const runtimeCaching: RuntimeCachingRule[]
  export default runtimeCaching
}
