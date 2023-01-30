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
        } xl:inline-block h-[calc(100vh-2*0.5rem)] fixed z-10`}
        onClick={toggleHandler}
      >
        <Sidebar sideBar={sideBar} sideBarHandler={toggleHandler} />
      </div>
      <div className="col-start-3 col-span-10">
        <div className='sticky top-0 bg-white z-5'>
          <Navbar sideBar={sideBar} sideBarHandler={toggleHandler} />
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default Home