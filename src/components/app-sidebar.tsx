import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, ChevronRight, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { menuConfig } from "@/config/menu.config"
import Logo from "@/assets/images/full-logo.png"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/context/AuthContext"

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [search, setSearch] = React.useState("")
  const isSearching = search.trim().length > 0

  // Checks if a url matches the current route or sub-route
  const isUrlActive = (url: string) => {
    if (location.pathname === url) return true;
    if (url === "/registered-patients" && location.pathname.startsWith("/op/registration")) return true;
    if (url === "/revisit-records" && (location.pathname === "/op/revisit" || location.pathname.startsWith("/op/revisit/"))) return true;
    if (url === "/op/revisit-cancellation" && location.pathname.startsWith("/op/revisit-cancellation")) return true;
    if (url === "/registered-anc-records" && location.pathname.startsWith("/antenatal-registration")) return true;
    if (url === "/hospital-master-records" && location.pathname.startsWith("/hospital-master")) return true;
    if (url === "/referral-master-records" && location.pathname.startsWith("/referral-master")) return true;
    return false;
  }

  // Checks if any child of a parent item is active
  const isParentActive = (item: any) =>
    item.items?.some((sub: any) => isUrlActive(sub.url))

  // Explicit open-state map, keyed by item title
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    menuConfig.forEach((item) => {
      if (item.items && isParentActive(item)) {
        initial[item.title] = true
      }
    })
    return initial
  })

  // Auto-expand parent menu when route changes
  React.useEffect(() => {
    menuConfig.forEach((item) => {
      if (item.items && isParentActive(item)) {
        setOpenItems((prev) => ({ ...prev, [item.title]: true }))
      }
    })
  }, [location.pathname])

  const toggleItem = (title: string, next: boolean) => {
    setOpenItems((prev) => ({ ...prev, [title]: next }))
  }

  // Search filtering
  const filteredMenu = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return menuConfig

    return menuConfig
      .map((item) => {
        const titleMatches = item.title.toLowerCase().includes(q)

        if (!item.items) {
          return titleMatches ? item : null
        }

        const matchingSubs = item.items.filter((sub: any) =>
          sub.title.toLowerCase().includes(q)
        )

        if (titleMatches) {
          return item
        }
        if (matchingSubs.length > 0) {
          return { ...item, items: matchingSubs }
        }
        return null
      })
      .filter(Boolean) as typeof menuConfig
  }, [search])

  const hasResults = filteredMenu.length > 0

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader
        className="px-4 py-3 font-bold border-b flex justify-start items-center gap-2 overflow-hidden h-14"
        style={{ background: "var(--sidebar-top-bg)", color: "white" }}
      >
        <div className="flex items-center gap-2">
          <img src={Logo} className="w-auto h-8 object-contain shrink-0" alt="Hospital Logo" />
        </div>
      </SidebarHeader>

      {/* Menu Search */}
      <div className="px-3 pt-3 pb-1 group-data-[collapsible=icon]:hidden">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-7 text-xs outline-none placeholder:text-muted-foreground focus:border-slate-400"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Navigation Content */}
      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="mt-1">
            {isSearching && !hasResults ? (
              <div className="px-3 py-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                No menu items match "{search}"
              </div>
            ) : (
              <SidebarMenu className="gap-1">
                {filteredMenu.map((item) => {
                  // Single link item (no submenu)
                  if (!item.items) {
                    const isActive = isUrlActive(item.url)
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          render={
                            <NavLink
                              to={item.url}
                              className={cn(
                                "flex items-center gap-2.5 w-full h-9 px-3 rounded-md text-xs font-medium transition-colors",
                                isActive && "theme-color font-semibold"
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge className="ml-auto group-data-[collapsible=icon]:hidden text-[10px]">
                                  {item.badge}
                                </Badge>
                              )}
                            </NavLink>
                          }
                          tooltip={item.title}
                          isActive={isActive}
                        />
                      </SidebarMenuItem>
                    )
                  }

                  const parentActive = isParentActive(item)
                  const isOpen = isSearching ? true : openItems[item.title] ?? parentActive

                  // Collapsed sidebar popover menu
                  if (isCollapsed) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <SidebarMenuButton
                                tooltip={item.title}
                                className={cn(
                                  "flex items-center justify-center h-9 w-full rounded-md transition-colors",
                                  parentActive && "theme-color font-semibold"
                                )}
                              >
                                <item.icon className="h-4 w-4 shrink-0" />
                              </SidebarMenuButton>
                            }
                          />
                          <DropdownMenuContent side="right" align="start" className="min-w-48 shadow-md">
                            <div className="px-3 py-1.5 text-xs font-bold text-slate-900 border-b border-slate-100">
                              {item.title}
                            </div>
                            {item.items.map((sub) => {
                              const subActive = isUrlActive(sub.url)
                              return (
                                <DropdownMenuItem
                                  key={sub.title}
                                  className={cn("p-0 cursor-pointer", subActive && "bg-slate-100")}
                                >
                                  <NavLink
                                    to={sub.url}
                                    className={cn(
                                      "flex items-center gap-2.5 px-3 py-2 text-xs w-full text-slate-700 hover:text-slate-900",
                                      subActive && "font-semibold text-blue-700"
                                    )}
                                  >
                                    <sub.icon className="h-3.5 w-3.5 shrink-0" />
                                    <span>{sub.title}</span>
                                  </NavLink>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    )
                  }

                  // Collapsible parent menu (expanded sidebar)
                  return (
                    <Collapsible
                      key={item.title}
                      open={isOpen}
                      onOpenChange={(next: boolean) => toggleItem(item.title, next)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton
                              tooltip={item.title}
                              className={cn(
                                "flex items-center gap-2.5 w-full h-9 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                parentActive && "theme-color font-semibold"
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge className="ml-auto mr-1 group-data-[collapsible=icon]:hidden text-[10px]">
                                  {item.badge}
                                </Badge>
                              )}
                              <ChevronRight
                                className={cn(
                                  "ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden text-slate-400",
                                  isOpen && "rotate-90 text-slate-600"
                                )}
                              />
                            </SidebarMenuButton>
                          }
                        />
                        <CollapsibleContent>
                          <SidebarMenuSub className="my-1 border-l-2 border-slate-200 ml-4 pl-2 space-y-1">
                            {item.items.map((sub) => {
                              const subActive = isUrlActive(sub.url)
                              return (
                                <SidebarMenuSubItem key={sub.title}>
                                  <SidebarMenuSubButton
                                    render={
                                      <NavLink
                                        to={sub.url}
                                        className={cn(
                                          "flex items-center gap-2.5 w-full h-8 px-2.5 rounded-md text-xs transition-colors",
                                          subActive
                                            ? "theme-color font-semibold"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                                        )}
                                      >
                                        <sub.icon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{sub.title}</span>
                                      </NavLink>
                                    }
                                  />
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-3">
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton
            tooltip="Logout"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full h-9 px-3 rounded-md text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}