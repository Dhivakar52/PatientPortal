import {
  LayoutDashboard,
  Calendar,
  FlaskConical,
  Receipt,
  Building2,
} from "lucide-react"
import { lazy } from "react"

export type LucideIcon = React.ComponentType<any>

export interface SubMenuItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
  items?: SubMenuItem[]
}

// ✅ Menu data for sidebar
export const menuConfig: MenuItem[] = [
  {
    title: "Home",
    url: "/home",
    icon: LayoutDashboard
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar
  },
  {
    title: "Laboratory",
    url: "/laboratory",
    icon: FlaskConical
  },
  {
    title: "OP Billing",
    url: "/op-billing",
    icon: Receipt
  },
  {
    title: "IP Billing",
    url: "/ip-billing",
    icon: Building2
  },
]

// Routes configuration (public and protected)
export const getRoutes = () => {
  return [
    // ============ PUBLIC ROUTES ============
    {
      path: "/",
      name: "Login",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/login",
      name: "Login",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/registration",
      name: "Registration",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/register",
      name: "Register",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/select-profile",
      name: "Select Profile",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/select",
      name: "Select Profile",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/home",
      name: "Home",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/appointments",
      name: "Appointments",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/visit-appointments",
      name: "Visit Appointments",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/book-appointments",
      name: "Book Appointments",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/appointment",
      name: "Appointment",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/visits",
      name: "Visits",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/visit",
      name: "Visit",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/book",
      name: "Book",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/profile",
      name: "Profile",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/lab",
      name: "Lab",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/bills",
      name: "Bills",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },

    // ============ PROTECTED ROUTES ============
    {
      path: "/settings",
      name: "Settings",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      protected: true,
    },
  ]
}