import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/shared/Button";
import TableField from "../../components/shared/TableField";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  relationships: Array<{
    _id: string;
    relativeName: string;
    relationship: string;
    startDate: string;
    endDate?: string;
  }>;
  medications: Array<{
    _id: string;
    medicationName: string;
    dosage?: string;
    frequency?: string;
    startDate: string;
    endDate?: string;
    status: string;
  }>;
  visits: Array<{
    _id: string;
    department: string;
    startDate: string;
    endDate?: string;
    status: string;
  }>;
}

const Overview = () => {
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

  // Prepare relationships data for table
  const relationships = patient?.relationships?.map((rel) => ({
    Relative: rel.relativeName,
    Relationship: rel.relationship,
    "Start Date": formatDate(rel.startDate),
    "End Date": formatDate(rel.endDate || ""),
  })) || [];

  // Prepare medications data for table
  const medications = patient?.medications?.map((med) => ({
    "Medication Name": med.medicationName,
    Dosage: med.dosage || "N/A",
    Frequency: med.frequency || "N/A",
    "Start Date": formatDate(med.startDate),
    Status: med.status,
  })) || [];

  // Prepare recent visits data
  const recentVisits = patient?.visits?.slice(-5).map((v) => ({
    ID: v._id,
    Department: v.department,
    "Start Date": formatDate(v.startDate),
    "End Date": formatDate(v.endDate || ""),
    Status: v.status,
  })) || [];

  if (loading) {
    return (
      <div className="m-4 p-4 space-y-6">
        <p className="text-gray-500">Loading overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 p-4 space-y-6">
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Sample programs data (placeholder for now)
  const programs = [
    {
      ID: "N/A",
      Name: "No programs enrolled",
      Description: "N/A",
      "Concept Name": "N/A",
      Workflows: "N/A",
      "Possible Outcomes Defined by": "N/A",
    },
  ];

  return (
    <>
      <div className="m-4 p-4 space-y-6">
        <div className="min-h-[100px]">
          <p className="textSize-550 font-semibold text-gray-primary">
            Patient Actions
          </p>
          {patient?.visits?.some((v) => v.status === "active") ? (
            <p className="text-green-600 text-sm">
              Active visit in progress
            </p>
          ) : (
            <p className="text-gray-500 text-sm">No active visit</p>
          )}
        </div>
        <hr />
        <div className="space-y-6">
          <p className="textSize-550 text-gray-primary font-semibold">
            Recent Visits
          </p>
          {recentVisits.length > 0 ? (
            <TableField tableData={recentVisits} actionsButton={true} />
          ) : (
            <p className="text-gray-500 text-sm">No visits found</p>
          )}
        </div>
        <div className="space-y-6">
          <p className="textSize-550 text-gray-primary font-semibold">
            Programs
          </p>
          <TableField tableData={programs} actionsButton={true} />
          <Button text="+ Add Program" varientColor="primary" size="sm" />
        </div>
        <div className="space-y-6">
          <p className="textSize-550 font-semibold text-gray-primary">
            Relationships
          </p>
          {relationships.length > 0 ? (
            <TableField tableData={relationships} actionsButton={true} />
          ) : (
            <p className="text-gray-500 text-sm">No relationships found</p>
          )}
          <Button text="+ Add Relationship" varientColor="primary" size="sm" />
        </div>
        {medications.length > 0 && (
          <div className="space-y-6">
            <p className="textSize-550 text-gray-primary font-semibold">
              Current Medications
            </p>
            <TableField tableData={medications} actionsButton={true} />
          </div>
        )}
      </div>
    </>
  );
};

export default Overview;