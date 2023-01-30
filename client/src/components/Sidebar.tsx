import {RxCross1 } from '../assets/icons/react-icons'
import { Link } from "react-router-dom";

const Sidebar = ({
  sideBar,
  sideBarHandler,
}: {
  sideBar: Boolean;
  sideBarHandler: () => void;
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <img
          className="h-[70px] mx-3 my-1"
          src=".\src\assets\logo.png"
          alt="Healthcare"
        />
        <div onClick={sideBarHandler}>
          {sideBar && (
            <RxCross1 className={`text-3xl text-primary xl:hidden`} />
          )}
        </div>
      </div>

      <div className="mt-44 ">
        <Link to="create-patient">
          <p className="sidebar-menu-option">create patient</p>
        </Link>
        <Link to="search-patient">
          <p className="sidebar-menu-option">search patient</p>
        </Link>
        <Link to="active-visit">
          <p className="sidebar-menu-option">active visit</p>
        </Link>
        <Link to="schedule">
          <p className="sidebar-menu-option">schedule</p>
        </Link>
        <Link to="appointments">
          <p className="sidebar-menu-option">appointments</p>
        </Link>
        <Link to="manage-locations">
          <p className="sidebar-menu-option">manage locations</p>
        </Link>
        <Link to="radiology-reports">
          <p className="sidebar-menu-option">radiology reports</p>
        </Link>
        <Link to="dictionary">
          <p className="sidebar-menu-option">dictionary</p>
        </Link>
        <Link to="settings">
          <p className="sidebar-menu-option">settings</p>
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
