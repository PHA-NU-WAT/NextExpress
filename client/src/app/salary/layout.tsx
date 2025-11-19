import { AppSidebar } from "@/components/sidebar-salary"
import { AppHeader } from "@/components/nav-header"
import ContentWrapper from "@/components/content-wrapper"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ กำหนด breadcrumbTitle ภายใน ไม่รับเป็น prop
  const breadcrumbTitle = "สลิปเงินเดือน"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader breadcrumbTitle={breadcrumbTitle} />
        <ContentWrapper>{children}</ContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
