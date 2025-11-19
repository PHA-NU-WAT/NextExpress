import React, { createContext, useContext, useState, useEffect } from "react"

interface AuthUser {
  username: string
  email: string
  avatar?: string
  roles: string[]
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = localStorage.getItem("user")

    if (cached && cached !== "undefined" && cached !== "null") {
      try {
        const parsed: AuthUser = JSON.parse(cached)
        parsed.roles = Array.isArray(parsed.roles)
          ? parsed.roles
          : typeof parsed.roles === "string"
          ? [parsed.roles]
          : []
        setUser(parsed)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem("user")
      }
    }

    // 🔹 fetch โปรไฟล์จาก cookie หลังจากไม่มี cache
    const fetchProfile = async () => {
      console.log("ไม่พบข้อมูลต้อง fetch");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile`, {
          credentials: "include",
        })

        if (!res.ok) {
          // อย่า redirect ทันที ปล่อยให้ component ตัดสินใจภายนอก
          console.warn("unauthorized or invalid token", res.status)
          logout()
          return
        }

        const data = await res.json()
        if (data.success && data.user) {
          setUser(data.user) // ต้องมีบรรทัดนี้
          localStorage.setItem("user", JSON.stringify(data.user))
        }
      } catch (err) {
        console.error("auth error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const login = (newUser: AuthUser) => {
    const safeUser = {
      ...newUser,
      roles: Array.isArray(newUser.roles)
        ? newUser.roles
        : typeof newUser.roles === "string"
        ? [newUser.roles]
        : [],
    }
    setUser(safeUser)
    localStorage.setItem("user", JSON.stringify(safeUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
