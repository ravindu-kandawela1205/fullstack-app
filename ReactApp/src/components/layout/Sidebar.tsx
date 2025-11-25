import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserCog, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes.constant";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/authStore";

const menuItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.product_list, label: "Products", icon: Users },
  { path: ROUTES.LOCAL_USERS, label: "Local Users", icon: UserCog, adminOnly: false },
];

export default function Sidebar() {
  const { user } = useAuth();
  
  return (
    <div className="fixed top-0 left-0 flex flex-col w-64 h-screen text-gray-900 bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        {user?.role === 'admin' ? (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Panel</h1>
        ) : (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Panel</h1>
        )}

        
        
       
      </div>
      <nav className="flex-1 p-4 overflow-auto">
        <div className="space-y-2">
          {menuItems.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
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
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="flex items-center justify-center w-10 h-10 overflow-hidden text-sm font-medium text-white bg-black rounded-full dark:bg-blue-500">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="object-cover w-full h-full"
                onError={(e) => {
                  console.error('Profile image failed to load:', user.profileImage);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
