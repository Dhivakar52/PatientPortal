import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "@/routes"
import { ThemeProvider } from "@/context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { Toaster } from "@/components/ui/toast"
import "./App.css"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App