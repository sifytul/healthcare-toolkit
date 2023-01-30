import { Outlet } from "react-router-dom";
import { FaEdit, HiXCircle } from "../assets/icons/react-icons";
import SecondaryNavbar from "../components/SecondaryNavbar";
import Button from "../components/shared/Button";
import Overview from "./PatientComponents/Overview";

const PatientDashboard = () => {
  return (
    <div>
      {/* patient details */}
      <div className="border border-gray-300 m-4 p-4 lg:m-6 lg:p-6 rounded-md shadow-sm space-y-3">
        <div className="flex justify-between">
          <div className="">
            <p className="textSize-500 font-bold">Marcos Alonso</p>
            <p className="space-x-6 text-gray-secondary ">
              <span>
                Male - <strong>27</strong> Years
              </span>
              <span>
                DOB:<strong> 02-Jun-1995</strong>
              </span>
            </p>
            <p className="space-x-5 text-gray-secondary">
              <span>
                BMI: <strong>22</strong>
              </span>
              <span>
                Weight: <strong>55 kg</strong>
              </span>
              <span>
                Height: <strong>5ft 4 inches</strong>
              </span>
            </p>
            <p className="space-x-5 text-gray-secondary">
              <span>
                CD4: <strong> </strong>
              </span>
              <span>
                Regimen: <strong></strong>
              </span>
            </p>
          </div>
          <div className="">
            <img
              className="h-20 w-20 object-cover rounded-full static   "
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
            />
            <p>
              Identification Number: <strong>{" 999999"}</strong>
            </p>
          </div>
        </div>
        <hr />
        <div className="text-sm text-gray-secondary">
          <div className="flex gap-3 items-center">
            <p>
              <strong>Active Visit:</strong> Visit at Medicine Department from{" "}
              <strong>Today 12:00AM until 04/06/2022</strong>
            </p>
            <Button text="Edit Visit" varientColor="primary" />
            <Button text={"End Visit"} varientColor={"delete"} />
          </div>
          <div>
            <strong>Encounters:</strong>
            <ul>
              <li>Radiology Provider Encounter</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Patient Overview  */}
      <SecondaryNavbar />
      <Outlet />
    </div>
  );
};

export default PatientDashboard;
