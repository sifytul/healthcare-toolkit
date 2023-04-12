import { Route, Routes } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import Welcome from "./components/Welcome";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import Antibiogram from "./pages/PatientComponents/Antibiogram";
import Demographics from "./pages/PatientComponents/Demographics";
import EditPatient from "./pages/PatientComponents/EditPatient/EditPatient";
import FormEntry from "./pages/PatientComponents/FormEntry";
import Graphs from "./pages/PatientComponents/Graphs";
import Overview from "./pages/PatientComponents/Overview";
import Radiology from "./pages/PatientComponents/Radiology";
import Visits from "./pages/PatientComponents/Visits";
import PatientDashboard from "./pages/PatientDashboard";
import SearchPatients from "./pages/searchPatients";
import SignIn from "./pages/signIn";

interface propType {}

function App() {
  // const [state, setState] = useState()

  // if(state) {
  //   console.log(state)
  // }

  // useEffect(() => {
  //   async function fetcher() {
  //   const response = await fetch("data.json")
  //   const data = await response.json()
  //   setState(data)
  //   }

  //   fetcher()
  // },[])

  // if (!state) {
  //   return
  // }
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Welcome />} />
          <Route path="create-patient" element={<HeroSection />} />
          <Route path="search-patient" element={<SearchPatients />} />
          <Route
            path="search-patient/patient-dashboard/:id"
            element={<PatientDashboard />}
          >
            <Route path="overview" element={<Overview />} />
            <Route path="visits" element={<Visits />} />
            <Route path="demographics" element={<Demographics />} />
            <Route path="form-entry" element={<FormEntry />} />
            <Route path="graphs" element={<Graphs />} />
            <Route path="antibiogram" element={<Antibiogram />} />
            <Route path="radiology" element={<Radiology />} />
          </Route>
          <Route path="edit-patient" element={<EditPatient />} />
          <Route path="/*" element={<PageNotFound />} />
        </Route>
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  );
}

export default App;
