import { NavLink, useLocation } from "react-router-dom";
import classnames from 'classnames'
import NavBarLink from "./shared/NavLink";

function SecondaryNavbar() {
  return (
    <nav className="flex items-center p-4 bg-secondary ">
      <NavBarLink text="Overview" url="/search-patient/patient-dashboard/1/overview" />
      <NavBarLink
        text="Visits"
        url="/search-patient/patient-dashboard/1/visits"
      />
      <NavBarLink text="Demographics" url="/demographics" />
      <NavBarLink text="Graphs" url="/graphs" />
      <NavBarLink text="Form Entry" url="/from-entry" />
      <NavBarLink text="Antibiogram" url="/antibiogram" />
      <NavBarLink text="Radiology" url="/radiology" />
    </nav>
  );
}

export default SecondaryNavbar;
