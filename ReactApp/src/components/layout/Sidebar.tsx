import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserCog, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes.constant";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.USERS_LIST, label: "Products", icon: Users },
  { path: ROUTES.LOCAL_USERS, label: "Local Users", icon: UserCog },
];

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </div>
      <nav className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-sidebar-foreground/70">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
