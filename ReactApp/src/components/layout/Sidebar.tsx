import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserCog, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes.constant";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/authStore";

const menuItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.USERS_LIST, label: "Products", icon: Users },
  { path: ROUTES.LOCAL_USERS, label: "Local Users", icon: UserCog },
];

export default function Sidebar() {
  const { user } = useAuth();
  
  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Panel</h1>
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
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
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
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="h-12 w-12 rounded-full bg-black dark:bg-blue-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
