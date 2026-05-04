import { Fragment, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Menu, User, LogOut, Users, Upload, HelpCircle, ChevronRight } from "lucide-react";

const Navbar = ({
  sideBar,
  sideBarHandler,
}: {
  sideBar: Boolean;
  sideBarHandler: () => void;
}) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  let navigatedPath: string[] = [];
  if (location.pathname === "/") {
    navigatedPath.push("root");
  } else {
    let navigatedArray = location.pathname.split("/");
    navigatedArray.forEach((val) => {
      if (val === "") {
        navigatedPath.push("root");
      } else if (val.includes("-")) {
        navigatedPath.push(val.replace("-", " ").toUpperCase());
      } else {
        navigatedPath.push(val.toUpperCase());
      }
    });
  }

  const handleLogout = async () => {
    await logout();
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      doctor: "Doctor",
      patient: "Patient",
      diagnostic_center: "Diagnostic Center",
    };
    return labels[role] || role;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-14 border-b border-orange-100 flex items-center gap-4 xl:justify-between bg-white">
      {/* Mobile menu button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`xl:hidden ml-2 ${sideBar ? "hidden" : "inline-flex"}`}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col gap-4 mt-8">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            {currentUser?.role === "doctor" && (
              <Link to="/search-patient">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Patients
                </Button>
              </Link>
            )}
            {currentUser?.role === "diagnostic_center" && (
              <Link to="/upload-report">
                <Button variant="ghost" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </Link>
            )}
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={sideBarHandler}
        className={`xl:hidden ${sideBar ? "hidden" : "inline-flex"}`}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb navigation */}
      <div className="flex items-center">
        {navigatedPath.map((value, ind) => (
          <Fragment key={ind}>
            {value === "root" ? (
              <Link
                to="/"
                className={`${
                  ind === navigatedPath.length - 1
                    ? "bg-orange-500 text-white"
                    : "bg-white text-orange-500 border border-orange-500"
                } w-fit px-2 py-1 rounded flex items-center justify-center`}
              >
                <Home className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <ChevronRight className="text-orange-500 h-4 w-4" />
                <span
                  className={`${
                    ind === navigatedPath.length - 1
                      ? "bg-orange-500 text-white"
                      : "bg-orange-50 text-orange-600"
                  } px-2 py-1 rounded font-bold text-sm`}
                >
                  {value}
                </span>
              </>
            )}
          </Fragment>
        ))}
      </div>

      {/* Desktop navigation */}
      <nav className="hidden xl:flex items-center gap-2 px-4">
        <Link to="/">
          <Button variant="ghost">Home</Button>
        </Link>
        {currentUser && (
          <>
            {currentUser.role === "doctor" && (
              <Link to="/search-patient">
                <Button variant="ghost">Patients</Button>
              </Link>
            )}
            {currentUser.role === "diagnostic_center" && (
              <Link to="/upload-report">
                <Button variant="ghost">Upload Report</Button>
              </Link>
            )}
          </>
        )}
        <Button variant="ghost">Help</Button>

        {currentUser ? (
          <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(currentUser.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{currentUser.fullName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{currentUser.fullName}</span>
                  <span className="text-xs font-normal text-gray-500">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/signin">
            <Button variant="ghost">Log in</Button>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Navbar;