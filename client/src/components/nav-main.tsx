"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"



export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {

  const { isMobile, toggleSidebar } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Page</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // ตรวจสอบว่ามี sub-items หรือไม่
          const hasSubItems = item.items && item.items.length > 0

          // ถ้าไม่มี sub-items ให้เป็น Link ธรรมดา
          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={`${item.isActive
                    ? "bg-sidebar-accent text-primary dark:text-sidebar-accent-foreground"
                    : "active:text-primary dark:active:text-sidebar-accent-foreground"
                    }`}
                >
                  <Link
                    href={item.url}
                    onClick={async (e) => {
                      if (isMobile) {
                        e.preventDefault()
                        toggleSidebar()

                        // รอให้ Sheet ปิดก่อน
                        await new Promise((r) => setTimeout(r, 120))

                        window.location.href = item.url
                      }
                    }}
                  >

                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // ถ้ามี sub-items ให้เป็น Collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger
                  asChild
                  className={`${item.isActive
                    ? ""
                    : ""
                    }`}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`${item.isActive
                      ? "text-muted-foreground active:text-sidebar-accent-foreground"
                      : "active:text-sidebar-accent-foreground"
                      }`}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={`${subItem.isActive
                            ? "bg-sidebar-accent text-primary dark:text-sidebar-accent-foreground"
                            : "active:text-primary dark:active:text-sidebar-accent-foreground"
                            }`}
                        >
                          <Link
                            href={subItem.url}
                            onClick={async (e) => {
                              if (isMobile) {
                                e.preventDefault()
                                toggleSidebar()
                                await new Promise((r) => setTimeout(r, 120))
                                window.location.href = subItem.url
                              }
                            }}
                          >

                            <span>{subItem.title}</span>
                          </Link>

                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}