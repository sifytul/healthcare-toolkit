import {useState} from 'react'
import {Outlet} from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const Home = () => {
    const [sideBar, setSideBar] = useState(false);
    const toggleHandler = () => {
      setSideBar(!sideBar);
    };
  return (
    <div className="max-w-screen-2xl xl:grid xl:grid-cols-12">
      <div
        className={`col-span-2 m-2 bg-[var(--clr-secondary)] rounded-sm ${
          !sideBar ? "hidden" : "inline-block"
        } xl:inline-block h-[calc(100vh-2*0.5rem)]`}
      >
        <Sidebar sideBar={sideBar} sideBarHandler={toggleHandler} />
      </div>
      <div className="col-start-3 col-span-10">
        <Navbar sideBar={sideBar} sideBarHandler={toggleHandler} />
        <Outlet/>
      </div>
    </div>
  );
}

export default Home