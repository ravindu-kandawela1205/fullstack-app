import { Bell, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/store/authStore";
import { useTheme } from "@/store/themeStore";
import { useNavigate } from "react-router-dom";
import ProfileDialog from "@/components/ProfileDialog";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 right-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 left-64 dark:bg-gray-900 dark:border-gray-700">
      {user?.role === 'admin' ? (
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Welcome to Admin Panel</h2>

      ) : (
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Welcome to User Panel</h2>

      )}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{user?.name || "Admin User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
