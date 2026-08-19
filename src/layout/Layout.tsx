import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { Header } from "../components/Header"
import { Outlet } from "react-router-dom"

interface LayoutProps {
  children?: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
    initials?: string
  }
  notificationCount?: number
  breadcrumbItems?: {
    label: string
    href?: string
  }[]
}

export function Layout({
  children,
  // user, 
  // notificationCount = 3,
  breadcrumbItems = []
}: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex-1 flex flex-col min-h-screen w-0">
          <Header
            // user={user}
            // notificationCount={notificationCount}
            breadcrumbItems={breadcrumbItems}
          />

          <main className="flex-1 p-6 layerBg">{children || <Outlet />}</main>

          {/* <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground bg-background">
            <p>© 2026 MyApp. All rights reserved.</p>
          </footer> */}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
