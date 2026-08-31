import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { routes } from "./routes.config"
import ProtectedRoutes from "./ProtectedRoutes"
import { Layout } from "@/layout/Layout"
import { useAuth } from "@/context/AuthContext"
import { ErrorFallback } from "@/components/ErrorFallback"
import { PageLoader } from "@/components/PageLoader"

// Reusable wrapper — resetKeys la pathname pass panra, so route change aanaa
// boundary automatic-a reset aagum, "Try again" click pannanum nu venaam
const withRouteErrorBoundary = (children: React.ReactNode, key: string) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    resetKeys={[key]}
    onError={(error, info) => {
      console.error(`Route error [${key}]:`, error, info.componentStack)
    }}
  >
    {children}
  </ErrorBoundary>
)

export const AppRoutes = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const publicRoutes = routes.filter(route => !route.protected)
  const protectedRoutes = routes.filter(route => route.protected)

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location}>
        {/* Public Routes - No Layout */}
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={withRouteErrorBoundary(<route.component />, route.path)}
          />
        ))}

        {/* Protected Routes - With Layout */}
        <Route
          element={
            <ProtectedRoutes isAuthenticated={isAuthenticated}>
              {withRouteErrorBoundary(<Layout />, 'layout')}
            </ProtectedRoutes>
          }
        >
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoutes
                  isAuthenticated={isAuthenticated}
                  requiredRoles={(route as { roles?: string[] }).roles ?? []}
                >
                  {withRouteErrorBoundary(<route.component />, route.path)}
                </ProtectedRoutes>
              }
            />
          ))}
        </Route>

        {/* Redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  )
}