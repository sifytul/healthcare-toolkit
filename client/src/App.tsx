import { Route, Routes } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import TrialComp from "./components/TrialComp";
import Welcome from "./components/Welcome";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import Overview from "./pages/PatientComponents/Overview";
import Visits from "./pages/PatientComponents/Visits";
import PatientDashboard from "./pages/PatientDashboard";
import SearchPatients from "./pages/searchPatients";
import SignIn from "./pages/signIn";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Welcome />} />
          <Route path="create-patient" element={<HeroSection />} />
          <Route path="search-patient" element={<SearchPatients />}/>
          <Route path="search-patient/patient-dashboard/:id" element={<PatientDashboard/>}>
            <Route path="overview" element={<Overview/>}/>
            <Route path="visits" element= {<Visits/>}/>
             </Route>
        <Route path="/*" element={<PageNotFound/>}/>
          
        </Route>
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  );
}

export default App;
