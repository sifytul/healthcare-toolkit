import { Fragment, useState } from "react";
import {
  BsPersonCircle,
  FaHome,
  FiMenu,
  MdPlayArrow,
  FiLogOut,
} from "../assets/icons/react-icons";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Navbar = ({
  sideBar,
  sideBarHandler,
}: {
  sideBar: Boolean;
  sideBarHandler: () => void;
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  let navigatedPath = [];
  if (location.pathname == "/") {
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

  return (
    <div className="h-14 border-b border-amber-100 flex items-center gap-4 xl:justify-between">
      <FiMenu
        onClick={sideBarHandler}
        className={`text-primary ${
          sideBar ? "hidden" : "inline-block"
        } xl:hidden text-3xl cursor-pointer ml-4`}
      />

      {/* navigation bar  */}
      <div className="flex items-center">
        {navigatedPath.map((value, ind) => (
          <Fragment key={ind}>
            {value === "root" ? (
              <button
                className={`${
                  ind == navigatedPath.length - 1
                    ? "bg-primary text-white"
                    : "bg-white text-primary border border-primary"
                } w-fit px-2`}
              >
                <FaHome className=" text-xl" />
              </button>
            ) : (
              <>
                <MdPlayArrow className="text-primary" />
                <button
                  className={`${
                    ind == navigatedPath.length - 1
                      ? "bg-primary text-white"
                      : "bg-secondary text-primary"
                  } px-2 font-bold text-sm`}
                >
                  {value}
                </button>
              </>
            )}
          </Fragment>
        ))}
      </div>
      <nav className="hidden xl:inline-block px-4">
        <ul className="flex gap-4 items-center">
          <Link to="/">
            <li>Home</li>
          </Link>
          {currentUser && (
            <>
              {currentUser.role === "doctor" && (
                <>
                  <Link to="/search-patient">
                    <li>Patients</li>
                  </Link>
                </>
              )}
              {currentUser.role === "diagnostic_center" && (
                <>
                  <Link to="/upload-report">
                    <li>Upload Report</li>
                  </Link>
                </>
              )}
            </>
          )}
          <Link to="#">
            <li>Help</li>
          </Link>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2"
              >
                <BsPersonCircle className="text-primary text-2xl" />
                <span className="text-sm">{currentUser.fullName}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold">{currentUser.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {getRoleLabel(currentUser.role)}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FiLogOut />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin">
              <li>Log in</li>
            </Link>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
