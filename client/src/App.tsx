import { Route, Routes } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import TrialComp from "./components/TrialComp";
import Welcome from "./components/Welcome";
import Home from "./pages/Home";
import SearchPatients from "./pages/searchPatients";
import SignIn from "./pages/signIn";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Welcome />} />
          <Route path="create-patient" element={<HeroSection />} />
          <Route path="search-patient" element={<SearchPatients />}>
            <Route path="hello" element={<TrialComp/>}/>
          </Route>
        </Route>
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  );
}

export default App;
