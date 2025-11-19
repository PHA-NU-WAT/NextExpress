"use client"

import { ThemeProvider } from "@/provider/ThemeProvider"
import { AuthProvider } from "@/provider/AuthProvider"
import { ToasterProvider } from "@/provider/ToasterProvider"

import { NuqsAdapter } from "nuqs/adapters/next/app"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}
