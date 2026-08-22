import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { AppRoutes } from "@/routes"
import { ThemeProvider } from "@/context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { LabBillingProvider } from "@/context/LabBillingContext"
import { Toaster } from "@/components/ui/toast"
import "./App.css"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <LabBillingProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
              <Toaster />
            </LabBillingProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App