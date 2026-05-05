import { NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  Home,
  UserPlus,
  Search,
  ClipboardList,
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  Activity,
  Stethoscope,
  Pill,
  Shield,
  BarChart3,
  Building2,
  UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  sideBar?: boolean;
  sideBarHandler?: () => void;
  isCollapsed?: boolean;
}

const Sidebar = ({ sideBar = true, sideBarHandler, isCollapsed = false }: SidebarProps) => {
  const { currentUser } = useAuth();

  const role = currentUser?.role;

  const navGroups: NavGroup[] = [
    // Common for all authenticated users
    {
      title: "Main",
      items: [
        { path: "/", icon: Home, label: "Dashboard" },
        { path: "/search-patient", icon: Search, label: "Search Patients" },
      ],
    },
    // Doctor specific
    ...(role === "doctor"
      ? [
          {
            title: "Patient Care",
            items: [
              { path: "/create-patient", icon: UserPlus, label: "Create Patient" },
              { path: "/active-visit", icon: Stethoscope, label: "Active Visit" },
              { path: "/appointments", icon: Calendar, label: "Appointments" },
              { path: "/prescriptions", icon: Pill, label: "Prescriptions" },
              { path: "/diagnoses", icon: FileText, label: "Diagnoses" },
            ],
          },
          {
            title: "Reports",
            items: [
              { path: "/reports", icon: BarChart3, label: "Reports" },
              { path: "/antibiogram", icon: Activity, label: "Antibiogram" },
            ],
          },
        ]
      : []),
    // Patient specific
    ...(role === "patient"
      ? [
          {
            title: "My Care",
            items: [
              { path: "/my-appointments", icon: Calendar, label: "My Appointments" },
              { path: "/my-prescriptions", icon: Pill, label: "My Prescriptions" },
              { path: "/my-reports", icon: FileText, label: "My Reports" },
              { path: "/my-diagnoses", icon: Stethoscope, label: "My Diagnoses" },
            ],
          },
        ]
      : []),
    // Diagnostic center specific
    ...(role === "diagnostic_center"
      ? [
          {
            title: "Diagnostics",
            items: [
              { path: "/pending-orders", icon: FileText, label: "Pending Orders" },
              { path: "/upload-results", icon: Activity, label: "Upload Results" },
              { path: "/report-templates", icon: ClipboardList, label: "Templates" },
            ],
          },
        ]
      : []),
    // Admin specific
    ...(role === "admin"
      ? [
          {
            title: "Management",
            items: [
              { path: "/users", icon: Users, label: "Users" },
              { path: "/departments", icon: Building2, label: "Departments" },
              { path: "/settings", icon: Settings, label: "Settings" },
              { path: "/audit-logs", icon: Shield, label: "Audit Logs" },
            ],
          },
          {
            title: "Analytics",
            items: [
              { path: "/analytics", icon: BarChart3, label: "Analytics" },
              { path: "/reports", icon: FileText, label: "Reports" },
            ],
          },
        ]
      : []),
    // Government analyst specific
    ...(role === "government_analyst"
      ? [
          {
            title: "Analysis",
            items: [
              { path: "/epidemiology", icon: Activity, label: "Epidemiology" },
              { path: "/trends", icon: BarChart3, label: "Trends" },
              { path: "/outbreaks", icon: Shield, label: "Outbreaks" },
            ],
          },
        ]
      : []),
  ];

  const initials = currentUser
    ? `${currentUser.fullName.split(" ")[0][0]}${currentUser.fullName.split(" ")[1]?.[0] || ""}`
    : "U";

  return (
    <aside
      className={`
        flex flex-col h-full bg-secondary rounded-sm
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-64"}
        ${sideBar ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static
        fixed inset-y-0 left-0 z-40
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h1 className="text-lg font-bold text-primary">
            HealthToolkit
          </h1>
        )}
        {isCollapsed && (
          <span className="text-xl font-bold text-primary">HT</span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-3">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <h2 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h2>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                      ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`
                    }
                    onClick={sideBarHandler}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
              {!isCollapsed && <Separator className="mt-4" />}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info at bottom */}
      <div className="p-4 border-t border-border">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentUser?.fullName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser?.role || "Guest"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
