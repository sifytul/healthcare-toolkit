import { Fragment } from "react";
import {
  BsPersonCircle,
  FaHome,
  FiMenu,
  MdPlayArrow,
} from "../assets/icons/react-icons";

import { Link, useLocation } from "react-router-dom";

const Navbar = ({
  sideBar,
  sideBarHandler,
}: {
  sideBar: Boolean;
  sideBarHandler: () => void;
}) => {
  let navigatedPath = [];
  const location = useLocation();
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
        <ul className="flex gap-4 ">
          <Link to="/">
            <li>Home</li>
          </Link>
          <Link to="#">
            <li>Help</li>
          </Link>
          <Link to="#">
            <li>Profile</li>
          </Link>
          <Link to="#">
            <li>Log out</li>
          </Link>
          <Link to="">
            <BsPersonCircle className="text-primary text-2xl" />
          </Link>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
