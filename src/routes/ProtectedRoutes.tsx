import { type ReactNode, useEffect, useRef } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRoutesProps {
  children: ReactNode
  isAuthenticated?: boolean
  redirectTo?: string
  requiredRoles?: string[]
  loadingComponent?: ReactNode
}

const ProtectedRoutes = ({
  children,
  isAuthenticated = false,
  redirectTo = "/login",
  requiredRoles = [],
  loadingComponent,
}: ProtectedRoutesProps) => {
  const location = useLocation()
  const { user } = useAuth() // ✅ user comes from context, not manual localStorage parsing
  const hasShownToast = useRef(false)

  const userRoles = user?.roles || ["user"]

  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role))

  // ✅ Toast only — no localStorage writes here. AuthContext is the
  // single source of truth for auth state now.
  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      toast.error("Please login to access this page")
      hasShownToast.current = true
    } else if (isAuthenticated && !hasRequiredRole && !hasShownToast.current) {
      toast.error("You don't have permission to access this page")
      hasShownToast.current = true
    } else if (isAuthenticated && hasRequiredRole) {
      hasShownToast.current = false
    }
  }, [isAuthenticated, hasRequiredRole])

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (!hasRequiredRole) {
    return <Navigate to="/home" replace />
  }

  if (loadingComponent) {
    return <>{loadingComponent}</>
  }

  return <>{children}</>
}

export default ProtectedRoutes