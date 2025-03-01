
import { Home, Tags, Heart, User, Trash2, Lock, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: Tags, label: "Tags", path: "/app/tags" },
    { icon: Heart, label: "Favorites", path: "/app/favorites" },
    { icon: Lock, label: "Vault", path: "/app/vault" },
    { icon: User, label: "Profile", path: "/app/profile" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
    { icon: Trash2, label: "Trash", path: "/app/trash" },
  ];

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 ease-in-out border-r border-border bg-[#161616]`}
    >
      <div className="p-4">
        <h1
          className={`text-xl font-bold mb-8 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          BFound
        </h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 transition-colors ${
                location.pathname === item.path
                  ? "bg-[#0f62fe] text-white"
                  : "hover:bg-[#262730]"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={`ml-3 transition-all duration-200 ${
                  isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
