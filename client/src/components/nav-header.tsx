"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/provider/AuthProvider"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  User,
} from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppHeaderProps {
  breadcrumbTitle: string
}

export function AppHeader({ breadcrumbTitle }: AppHeaderProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  return (
    <header className="flex shrink-0 items-center gap-2 sticky top-0 z-1">
      <div className="flex w-full pt-0 px-4 xl:px-8">
        <div className="flex w-full bg-card rounded-br-xl rounded-bl-xl py-4 shadow-sm">
          {/* Left Side */}
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">PCSHS</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 px-4 ml-auto">
            <ModeToggle />
            {loading ? (
              // Skeleton Loading UI
              <div aria-hidden="true" className="animate-pulse flex items-center gap-2 px-2 py-1">
                <div className="flex flex-col gap-2 items-end py-1 hidden md:flex">
                  <div className="h-3 w-30 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                  <div className="h-3 w-36 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                </div>
                <div className="size-10 rounded-lg bg-gray-200 dark:bg-muted animate-pulse" />
              </div>
            ) : user ? (
              // User Loaded
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="grid flex-1 text-right text-sm leading-tight hidden md:block">
                      <div className="truncate font-medium">
                        {user.username ?? "ไม่ระบุชื่อ"}
                      </div>
                      <div className="truncate text-xs">
                        {user.email ?? "ไม่ระบุอีเมล"}
                      </div>
                    </div>
                    <div className="relative inline-block">
                      <Avatar className="size-10 rounded-lg">
                        <AvatarImage
                          src={user.avatar ?? ""}
                          alt={user.username ?? "user"}
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-[-3px] right-[-4px] block h-[13px] w-[13px] rounded-full border-2 border-white dark:border-card bg-[#4bd08b]" />

                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg z-999"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User />
                      ข้อมูลผู้ใช้
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logout`, {
                        method: "POST",
                        credentials: "include" // ส่ง cookie ไปด้วย
                      });

                      router.push("/login");
                    }}
                  >
                    <LogOut />
                    ลงชื่อออก
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
