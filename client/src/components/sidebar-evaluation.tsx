"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Users, Calendar, School } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TEAMS } from "@/config/teams"

interface LocalUser {
  id: number
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions?: string[] // ✅ เผื่อไว้ในอนาคต
}

const isActive = (pathname: string, url: string) =>
  pathname === url || (pathname.startsWith(url) && url !== "/")

const canAccess = (roles: string[], allowed?: string[]) =>
  !allowed || roles.some((r) => allowed.includes(r))

// ✅ เมนูหลัก (ใช้ role เป็นตัวกรอง)
const NAV_MAIN = [
  {
    title: "หน้าแรก",
    url: "/",
    icon: School,
    roles: ["guest", "teacher", "school_admin", "student"],
  },
  {
    title: "บันทึกผลการประเมิน",
    url: "/evaluation",
    icon: Users,
    roles: ["teacher", "school_admin"],
    items: [
      { title: "รายวิชาพื้นฐาน/เพิ่มเติม", url: "/evaluation/record/subjects" },
      { title: "รายวิชากิจกรรม", url: "/evaluation/record/activities" },
      { title: "คุณลักษณะอันพึงประสงค์", url: "/evaluation/record/attributes" },
      { title: "การอ่าน คิดวิเคราะห์ และเขียน", url: "/evaluation/record/skills" },
    ],
  }
]

// ✅ Projects (เมนูรอง)
const PROJECTS = [
  { name: "สถิตินักเรียน", url: "/grade/10", icon: BarChart3 },
  { name: "สถิติผลการเรียน", url: "/grade/11", icon: BarChart3 },
  { name: "ปฏิทินกิจกรรม", url: "/calendar", icon: Calendar },
]

// ✅ Avatar Helper
const getAvatar = (user: LocalUser): string => {
  if (user.roles.includes("student")) return `/img/${user.id}.png`
  if (user.roles.includes("teacher")) return user.avatar || "/img/default-teacher.png"
  if (user.roles.includes("school_admin")) return user.avatar || "/img/admin.png"
  return "/img/guest.png"
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<LocalUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  // ✅ โหลด user จาก localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        const parsed = JSON.parse(stored)
        parsed.roles = Array.isArray(parsed.roles)
          ? parsed.roles
          : typeof parsed.roles === "string"
            ? [parsed.roles]
            : []
        setUser(parsed)
      } else {
        // ❌ ไม่มี user → redirect ไป login
        router.replace("/login")
      }
    } catch (err) {
      console.error("Failed to load user from localStorage:", err)
      router.replace("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  const roles = React.useMemo(() => user?.roles ?? ["guest"], [user])

  const visibleNavMain = React.useMemo(() => {
    return NAV_MAIN
      .filter((item) => canAccess(roles, item.roles))
      .map((item) => ({
        ...item,
        isActive: isActive(pathname, item.url),
        items: item.items?.map((sub) => ({
          ...sub,
          isActive: pathname === sub.url,
        })),
      }))
  }, [roles, pathname])


  // ✅ กรองทีมตาม role
  const visibleTeams = TEAMS.filter((team) => canAccess(roles, team.roles))

  // ✅ Projects
  const projects = PROJECTS.map((p) => ({
    ...p,
    isActive: pathname === p.url,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={visibleTeams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={visibleNavMain} />
        <NavProjects projects={projects} />
      </SidebarContent>

      <SidebarFooter>
        {loading ? (
          <div className="animate-pulse flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-muted animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-30 bg-gray-200 dark:bg-muted rounded animate-pulse" />
              <div className="h-3 w-35 bg-gray-200 dark:bg-muted rounded animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <NavUser
            user={{
              name: user.username,
              email: user.email || "",
              avatar: getAvatar(user),
            }}
          />
        ) : (
          <div className="text-sm text-muted-foreground px-2 py-1">
            ไม่พบข้อมูลผู้ใช้
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
