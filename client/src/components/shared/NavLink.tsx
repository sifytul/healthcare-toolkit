import { NavLink, useLocation } from "react-router-dom";
import classnames from 'classnames'
const NavBarLink = ({text, url}: {text:string, url:string}) => {
    
    const location = useLocation();
  return (
    <NavLink
      className={classnames("text-lg font-semibold text-gray-secondary hover:border-primary ml-8", {
        "font-bold text-gray-primary border-b-2 border-[var(--clr-primary)]": location.pathname === url,
      })}
      to={url}
    >
      {text}
    </NavLink>
  );
};

export default NavBarLink;
