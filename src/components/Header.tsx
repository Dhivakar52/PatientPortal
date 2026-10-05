import { Fragment } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  UserPlus,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import NotificationPanel from "./NotificationPanel"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/toast"

interface HeaderProps {
  breadcrumbItems?: {
    label: string
    href?: string
  }[]
}

// ✅ Segments that should render fully uppercase instead of
// Title-Case (HIS module abbreviations). Add more as needed.
const ACRONYMS = new Set(["op", "ip", "mrd", "anc", "uhid", "abha", "vip", "kin", "opd", "ipd"])

// Helper function to format breadcrumb labels
const formatLabel = (str: string): string => {
  // First, convert to lowercase for checking
  const lowerStr = str.toLowerCase()
  
  // Check if it's an acronym (case insensitive)
  if (ACRONYMS.has(lowerStr)) {
    return str.toUpperCase() // "op" → "OP", "Op" → "OP"
  }
  
  // Direct mapping for common combined words
  const wordMap: Record<string, string> = {
    'diagnosisentry': 'Diagnosisentry',
    'patientregistration': 'Patient Registration',
    'appointmentschedule': 'Appointment Schedule',
    'billingreport': 'Billing Report',
    'labtest': 'Lab Test',
    'bloodtest': 'Blood Test',
    'opconsultation': 'OP Consultation',
    'ippatient': 'IP Patient',
    'mrdrecord': 'MRD Record',
    'registration': 'Registration',
    'diagnosis': 'Diagnosis',
    'entry': 'Entry',
    'patient': 'Patient',
    'appointment': 'Appointment',
    'billing': 'Billing',
    'report': 'Report',
  }
  
  if (wordMap[lowerStr]) {
    return wordMap[lowerStr]
  }
  
  // Split by '-' if any
  const parts = str.split('-')
  if (parts.length > 1) {
    return parts
      .map(part => {
        const partLower = part.toLowerCase()
        if (ACRONYMS.has(partLower)) {
          return part.toUpperCase()
        }
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join(' ')
  }
  
  // Default: capitalize first letter
  // For "registration" → "Registration"
  // For "diagnosis" → "Diagnosis"
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function Header({
  breadcrumbItems = []
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Parse the pathname and generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '')

    // If no segments, we're at the root — show Dashboard only
    if (pathSegments.length === 0) {
      return [{ label: "Dashboard", href: undefined }]
    }

    const breadcrumbs: { label: string; href?: string }[] = []
    let currentPath = ''

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      currentPath += `/${segment}`

      const label = formatLabel(segment)
      const isLast = i === pathSegments.length - 1

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      })
    }

    return breadcrumbs
  }

  const items = breadcrumbItems.length > 0 ? breadcrumbItems : generateBreadcrumbs()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const profileMenuItems = [
    { label: "Home", icon: Home, url: "/home" },
    { label: "Profile", icon: UserPlus, url: "/profile" },
  ]

  // Get user initials from name or email
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.userId) {
      return user.userId.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Get user display name
  const getUserName = () => {
    return user?.name || user?.userId || 'User'
  }

  // Get user email
  const getUserEmail = () => {
    return user?.userId || 'user@example.com'
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />

      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <Fragment key={index}>
              <BreadcrumbItem>
                {index === items.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href || "/"}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        {/* Notification Panel */}
        <NotificationPanel />

        <Separator orientation="vertical" className="h-8" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-1.5 py-1 cursor-pointer hover:bg-accent transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar || ""}
                    alt={getUserName()}
                  />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {getUserName()}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar || "https://github.com/shadcn.png"}
                      alt={getUserName()}
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium leading-none">{getUserName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getUserEmail()}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {profileMenuItems.map((item) => (
                <DropdownMenuItem key={item.label} onClick={() => navigate(item.url)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
