import { useEffect, useState } from "react";
import { Outlet, useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import SecondaryNavbar from "../components/SecondaryNavbar";

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

  const formatHeight = (cm?: number) => {
    if (!cm) return "N/A";
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}ft ${inches}in`;
  };

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
        <p className="text-muted-foreground">Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4 p-4 border-destructive/50 bg-destructive/10">
        <p className="text-destructive">Error: {error}</p>
        <Link to="/search-patient" className="text-primary underline mt-2 inline-block">
          Back to search
        </Link>
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card className="m-4 p-4 border-warning/50 bg-warning/10">
        <p>Patient not found</p>
        <Link to="/search-patient" className="text-primary underline mt-2 inline-block">
          Back to search
        </Link>
      </Card>
    );
  }

  return (
    <div className="scroll-smooth scrollbar-hide">
      <Card className="m-4 p-4 lg:m-6 lg:p-6 rounded-lg shadow-sm border-border">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl font-bold">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>
                {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "N/A"} - <strong>{calculateAge(patient.dateOfBirth)}</strong> Years
              </span>
              <span>
                DOB: <strong>{formatDate(patient.dateOfBirth)}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span>
                BMI: <strong>{patient.bmi || "N/A"}</strong>
              </span>
              <span>
                Weight: <strong>{patient.weight ? `${patient.weight} kg` : "N/A"}</strong>
              </span>
              <span>
                Height: <strong>{formatHeight(patient.height)}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span>
                Phone: <strong>{patient.phone || "N/A"}</strong>
              </span>
              <span>
                Email: <strong>{patient.email || "N/A"}</strong>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80" alt="Patient" />
            </Avatar>
            <p className="text-sm">
              Identification Number: <strong>{patient.patientId}</strong>
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="text-sm text-muted-foreground">
          {patient.activeVisit ? (
            <div className="flex flex-wrap gap-3 items-center">
              <p>
                <strong>Active Visit:</strong> Visit at {patient.activeVisit.department} Department from{" "}
                <strong>{formatDate(patient.activeVisit.startDate)}</strong>
                {patient.activeVisit.endDate && ` until ${formatDate(patient.activeVisit.endDate)}`}
              </p>
              <Button variant="default" size="sm">Edit Visit</Button>
              <Button variant="destructive" size="sm">End Visit</Button>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <p><strong>No Active Visit</strong></p>
              <Button variant="default" size="sm">Start New Visit</Button>
            </div>
          )}
        </div>
      </Card>

      <SecondaryNavbar />
      <Outlet />
    </div>
  );
};

export default PatientDashboard;