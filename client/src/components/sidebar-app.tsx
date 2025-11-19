"use client"

import * as React from "react"
import { redirect } from "next/navigation"

import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Settings, Calendar, School } from "lucide-react"

import { useAuth } from "@/provider/AuthProvider"
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
    title: "รายงานและสถิติ",
    url: "/reports",
    icon: BarChart3,
    roles: ["teacher", "school_admin"],
    items: [
      { title: "สถิตินักเรียน", url: "/reports/student-stats" },
      { title: "รายงานการเข้าเรียน", url: "/reports/attendance" },
      { title: "รายงานผลการเรียน", url: "/reports/academic-report" },
      { title: "ส่งออกข้อมูล", url: "/reports/export" },
    ],
  },
  {
    title: "การตั้งค่า",
    url: "/settings",
    icon: Settings,
    roles: ["school_admin"],
    items: [
      { title: "ตั้งค่าทั่วไป", url: "/settings/general" },
      { title: "จัดการผู้ใช้", url: "/settings/users" },
      { title: "จุดประเมิน", url: "/settings/grading" },
      { title: "ข้อมูลโรงเรียน", url: "/settings/school-info" },
    ],
  },
]

const PROJECTS = [
  { name: "สถิตินักเรียน", url: "/grade/10", icon: BarChart3 },
  { name: "สถิติผลการเรียน", url: "/grade/11", icon: BarChart3 },
  { name: "ปฏิทินกิจกรรม", url: "/calendar", icon: Calendar },
]

// ✅ Avatar Helper
const getAvatar = (user: { id?: number; avatar?: string; roles: string[] }): string => {
  if (user.roles.includes("student")) return `/img/${user.id}.png`
  if (user.roles.includes("teacher")) return user.avatar || "/img/default-teacher.png"
  if (user.roles.includes("school_admin")) return user.avatar || "/img/admin.png"
  return "/img/guest.png"
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  // ✅ ยังโหลด profile อยู่ → แสดง skeleton
  if (loading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="animate-pulse flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-muted animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-30 bg-gray-200 dark:bg-muted rounded animate-pulse" />
              <div className="h-3 w-35 bg-gray-200 dark:bg-muted rounded animate-pulse" />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
        </SidebarContent>

        <SidebarFooter>
          <div className="animate-pulse flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-muted animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-30 bg-gray-200 dark:bg-muted rounded animate-pulse" />
              <div className="h-3 w-35 bg-gray-200 dark:bg-muted rounded animate-pulse" />
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    )
  }


  if (!user) {
    redirect("/login")
  }

  const roles = user.roles ?? ["guest"]

  const visibleNavMain = NAV_MAIN.filter((item) => canAccess(roles, item.roles)).map((item) => ({
    ...item,
    isActive: isActive(pathname, item.url),
    items: item.items?.map((sub) => ({
      ...sub,
      isActive: pathname === sub.url,
    })),
  }))

  const visibleTeams = TEAMS.filter((team) => canAccess(roles, team.roles))
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
        <NavUser
          user={{
            name: user.username,
            email: user.email || "",
            avatar: getAvatar(user),
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

