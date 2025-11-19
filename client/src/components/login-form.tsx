"use client"
import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { School } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "./mode-toggle"
import { useAuth } from "@/provider/AuthProvider"
import toast from "react-hot-toast"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/" // ✅ path เดิม เช่น /register
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // ✅ แสดง toast เตือนเมื่อ session หมดอายุ
  // useEffect(() => {
  //   if (searchParams.has("redirect")) {
  //     toast.error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่")
  //   }
  // }, [searchParams])

  async function handleLogin(email: string, password: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด")

      login(data.user)
      toast.success("Login สำเร็จ!")
      setTimeout(() => router.push(redirectPath), 1000)
    } catch (err) {
      console.error("❌ Login error:", err)
      toast.error("Login ไม่สำเร็จ! " + (err instanceof Error ? err.message : ""))
    }
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await handleLogin(email, password)
  }

  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <School className="w-8 h-8 text-white" />
              </div>
            </CardDescription>
            <div className="text-center">
              <h1 className="text-2xl font-medium mb-2">เข้าสู่ระบบ</h1>
              <p className="text-muted-foreground">PCSHS Core</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </div>
              </div>
            </form>
            <Button variant="outline" className="w-full mt-2"
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}>
              <div className="relative w-5 h-5">
                <Image
                  alt="Google logo"
                  src="/img/google.svg"
                  fill
                  className="object-contain"
                />
              </div>
              Login with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
