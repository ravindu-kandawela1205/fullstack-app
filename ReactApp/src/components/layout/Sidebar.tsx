import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserCog } from "lucide-react";
import { ROUTES } from "@/constants/routes.constant";

const menuItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.USERS_LIST, label: "Products", icon: Users },
  { path: ROUTES.LOCAL_USERS, label: "Local Users", icon: UserCog },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
