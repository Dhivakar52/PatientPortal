import {
  LayoutDashboard,
  // Users,
  // UsersRound,
  // Stethoscope,
  // CalendarClock,
  // Baby,
  // Building2,
  // UserCheck,
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
    icon: LayoutDashboard
  },


  //     { 
  //   title: "Referral Master", 
  //   url: "/referral-master", 
  //   icon: LayoutDashboard 
  // },




  // { 
  //   title: "Analytics", 
  //   url: "/analytics", 
  //   icon: BarChart 
  // },
  // {
  //   title: "Users",
  //   url: "/users",
  //   icon: Users,
  //   badge: "12",
  //   items: [
  //     { title: "All Users", url: "/users", icon: Users },
  //     { title: "Add User", url: "/users/new", icon: UserPlus },
  //     { title: "Roles", url: "/users/roles", icon: UserCog },
  //   ],
  // },
  // {
  //   title: "Profile",
  //   url: "/profile",
  //   icon: UserCircle,
  // },
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  //   // items: [
  //   //   { title: "General", url: "/settings", icon: Settings },
  //   //   { title: "Notifications", url: "/settings/notifications", icon: Bell },
  //   //   { title: "Appearance", url: "/settings/appearance", icon: Palette },
  //   // ],
  // },
]

// Routes configuration (public and protected)
export const getRoutes = () => {
  return [
    // ============ PUBLIC ROUTES ============
    // {
    //   path: "/login",
    //   name: "Login",
    //   component: lazy(() => import("@/pages/Login")),
    //   exact: true,
    //   protected: false,
    // },
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

    // OP Screen




    // {
    //   path: "/analytics",
    //   name: "Analytics",
    //   component: lazy(() => import("@/pages/Analytics")),
    //   protected: true,
    // },
    // {
    //   path: "/users",
    //   name: "Users",
    //   component: lazy(() => import("@/pages/Users")),
    //   protected: true,
    //   roles: ["admin"],
    // },
    // {
    //   path: "/users/new",
    //   name: "Add User",
    //   component: lazy(() => import("@/pages/Users/AddUser")),
    //   protected: true,
    //   roles: ["admin"],
    // },
    // {
    //   path: "/users/roles",
    //   name: "Roles",
    //   component: lazy(() => import("@/pages/Users/Roles")),
    //   protected: true,
    //   roles: ["admin"],
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
    // {
    //   path: "/settings/notifications",
    //   name: "Notifications",
    //   component: lazy(() => import("@/pages/Settings/Notifications")),
    //   protected: true,
    // },
    // {
    //   path: "/settings/appearance",
    //   name: "Appearance",
    //   component: lazy(() => import("@/pages/Settings/Appearance")),
    //   protected: true,
    // },
  ]
}