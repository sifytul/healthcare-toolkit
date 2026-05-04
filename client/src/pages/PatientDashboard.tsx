import { useEffect, useState } from "react";
import { Outlet, useParams, Link } from "react-router-dom";
import SecondaryNavbar from "../components/SecondaryNavbar";
import Button from "../components/shared/Button";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  activeVisit?: {
    department: string;
    startDate: string;
    endDate?: string;
    status: string;
  };
}

const PatientDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;

      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch patient");
        }

        const data = await response.json();
        setPatient(data.data.patient);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format height to feet and inches
  const formatHeight = (cm?: number) => {
    if (!cm) return "N/A";
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}ft ${inches}in`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Error: {error}</p>
        <Link to="/search-patient" className="text-primary underline mt-2 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="m-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <p>Patient not found</p>
        <Link to="/search-patient" className="text-primary underline mt-2 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="scroll-smooth scrollbar-hide">
      {/* patient details */}
      <div className="border border-gray-300 m-4 p-4 lg:m-6 lg:p-6 rounded-md shadow-sm space-y-3">
        <div className="flex justify-between">
          <div className="">
            <p className="textSize-500 font-bold">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="space-x-6 text-gray-secondary ">
              <span>
                {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "N/A"} - <strong>{calculateAge(patient.dateOfBirth)}</strong> Years
              </span>
              <span>
                DOB:<strong> {formatDate(patient.dateOfBirth)}</strong>
              </span>
            </p>
            <p className="space-x-5 text-gray-secondary">
              <span>
                BMI: <strong>{patient.bmi || "N/A"}</strong>
              </span>
              <span>
                Weight: <strong>{patient.weight ? `${patient.weight} kg` : "N/A"}</strong>
              </span>
              <span>
                Height: <strong>{formatHeight(patient.height)}</strong>
              </span>
            </p>
            <p className="space-x-5 text-gray-secondary">
              <span>
                Phone: <strong>{patient.phone || "N/A"}</strong>
              </span>
              <span>
                Email: <strong>{patient.email || "N/A"}</strong>
              </span>
            </p>
          </div>
          <div className="">
            <img
              className="h-20 w-20 object-cover rounded-full static"
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
              alt="Patient"
            />
            <p>
              Identification Number: <strong>{patient.patientId}</strong>
            </p>
          </div>
        </div>
        <hr />
        <div className="text-sm text-gray-secondary">
          {patient.activeVisit ? (
            <div className="flex gap-3 items-center">
              <p>
                <strong>Active Visit:</strong> Visit at {patient.activeVisit.department} Department from{" "}
                <strong>{formatDate(patient.activeVisit.startDate)}</strong>
                {patient.activeVisit.endDate && ` until ${formatDate(patient.activeVisit.endDate)}`}
              </p>
              <Button text="Edit Visit" varientColor="primary" />
              <Button text={"End Visit"} varientColor={"delete"} />
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <p>
                <strong>No Active Visit</strong>
              </p>
              <Button text="Start New Visit" varientColor="primary" />
            </div>
          )}
        </div>
      </div>

      {/* Patient Overview  */}
      <SecondaryNavbar />
      <Outlet />
    </div>
  );
};

export default PatientDashboard;