import { NavLink, useLocation } from "react-router-dom";
import classnames from 'classnames'
import NavBarLink from "./shared/NavLink";

function SecondaryNavbar() {
  return (
    <nav className="flex items-center p-4 bg-secondary ">
      <NavBarLink
        text="Overview"
        url="/search-patient/patient-dashboard/1/overview"
      />
      <NavBarLink
        text="Visits"
        url="/search-patient/patient-dashboard/1/visits"
      />
      <NavBarLink
        text="Demographics"
        url="/search-patient/patient-dashboard/1/demographics"
      />
      <NavBarLink
        text="Graphs"
        url="/search-patient/patient-dashboard/1/graphs"
      />
      <NavBarLink
        text="Form Entry"
        url="/search-patient/patient-dashboard/1/form-entry"
      />
      <NavBarLink
        text="Antibiogram"
        url="/search-patient/patient-dashboard/1/antibiogram"
      />
      <NavBarLink
        text="Radiology"
        url="/search-patient/patient-dashboard/1/radiology"
      />
    </nav>
  );
}

export default SecondaryNavbar;


