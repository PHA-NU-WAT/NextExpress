import type { RemotePattern } from "next/dist/shared/lib/image-config"

const isDev = process.env.NODE_ENV === "development"

const devRemotePatterns: RemotePattern[] = [
  {
    protocol: "http",
    hostname: "125.27.241.61",
    pathname: "**",
  },
  {
    protocol: "http",
    hostname: "pcshs.duckdns.org",
    pathname: "**",
  },
]

const nextConfig = {
  reactCompiler: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      ...(isDev ? devRemotePatterns : []),
    ],
  },

  experimental: {
    ...(isDev
      ? {
          // ✅ ใช้ได้จริงใน runtime
          allowedDevOrigins: [
            "http://pcshs.duckdns.org",
            "http://125.27.241.61",
          ],
        }
      : {}),
  },
} satisfies Record<string, unknown> // ✅ ให้ TS ตรวจ shape คร่าว ๆ เฉย ๆ

export default nextConfig
