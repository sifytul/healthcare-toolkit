import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UserPlus,
  Search,
  Activity,
  Calendar,
  CalendarDays,
  MapPin,
  FileText,
  BookOpen,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  sideBar: Boolean;
  sideBarHandler: () => void;
}

const menuItems = [
  { path: "create-patient", label: "Create Patient", icon: UserPlus },
  { path: "search-patient", label: "Search Patient", icon: Search },
  { path: "active-visit", label: "Active Visit", icon: Activity },
  { path: "schedule", label: "Schedule", icon: Calendar },
  { path: "appointments", label: "Appointments", icon: CalendarDays },
  { path: "manage-locations", label: "Manage Locations", icon: MapPin },
  { path: "radiology-reports", label: "Radiology Reports", icon: FileText },
  { path: "dictionary", label: "Dictionary", icon: BookOpen },
  { path: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ sideBar, sideBarHandler }: SidebarProps) => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center p-2">
        <Link to="/" className="flex items-center">
          <img
            className="h-[70px] w-auto"
            src="./src/assets/logo.png"
            alt="Healthcare"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={sideBarHandler}
          className={`xl:hidden ${sideBar ? "inline-flex" : "hidden"}`}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Menu Items */}
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-1 p-2">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left font-normal text-sm uppercase tracking-wide text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </>
  );
};

export default Sidebar;