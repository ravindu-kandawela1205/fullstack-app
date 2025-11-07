import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navItems.constant';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
