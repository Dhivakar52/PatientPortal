import {
  LayoutDashboard,
  Calendar,
  FlaskConical,
  Receipt,
  Building2,
  type LucideIcon,
} from "lucide-react"
import { lazy } from "react"

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
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Appointment",
    url: "/appointment",
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
      path: "/appointment",
      name: "Appointment",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/patient/login",
      name: "Patient Login",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/patient/register",
      name: "Patient Registration",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/patient/select",
      name: "Patient Selection",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/patient/dashboard",
      name: "Patient Dashboard",
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
      path: "/patient/home",
      name: "Patient Home",
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
      path: "/visits",
      name: "Visits",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },
    {
      path: "/patient/visits",
      name: "Patient Visits",
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
      path: "/patient/lab",
      name: "Patient Lab",
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
    {
      path: "/patient/bills",
      name: "Patient Bills",
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
      path: "/patient/book",
      name: "Patient Book",
      component: lazy(() => import("@/pages/Patient/PatientModule")),
      exact: true,
      protected: false,
    },

    // ============ PROTECTED ROUTES ============
    {
      path: "/dashboard",
      name: "Dashboard",
      component: lazy(() => import("@/pages/Dashboard")),
      exact: true,
      protected: true,
    },
    // {
    //   path: "/laboratory",
    //   name: "Laboratory",
    //   component: lazy(() => import("@/pages/Laboratory/LaboratoryModule").then((m) => ({ default: m.LaboratoryModule }))),
    //   exact: true,
    //   protected: true,
    // },
    // {
    //   path: "/op-billing",
    //   name: "OP Billing",
    //   component: lazy(() => import("@/pages/OPBilling/OPBillingModule").then((m) => ({ default: m.OPBillingModule }))),
    //   exact: true,
    //   protected: true,
    // },
    // {
    //   path: "/ip-billing",
    //   name: "IP Billing",
    //   component: lazy(() => import("@/pages/IPBilling/IPBillingModule").then((m) => ({ default: m.IPBillingModule }))),
    //   exact: true,
    //   protected: true,
    // },
    {
      path: "/profile",
      name: "Profile",
      component: lazy(() => import("@/pages/Profile")),
      protected: true,
    },
    {
      path: "/settings",
      name: "Settings",
      component: lazy(() => import("@/pages/Setting")),
      protected: true,
    },
  ]
}