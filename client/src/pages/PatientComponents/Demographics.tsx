import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiEdit } from "../../assets/icons/react-icons";
import Button from "../../components/shared/Button";
import TableField from "../../components/shared/TableField";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Patient {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  relationships: Array<{
    _id: string;
    relativeName: string;
    relationship: string;
    phone?: string;
  }>;
  previousConditions: Array<{
    conditionName: string;
    diagnosedDate: string;
    notes?: string;
  }>;
  currentConditions: Array<{
    conditionName: string;
    diagnosedDate: string;
    notes?: string;
  }>;
  allergies: Array<{
    allergen: string;
    reaction?: string;
    severity?: string;
  }>;
}

const Demographics = () => {
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

  // Prepare addresses data for table
  const addresses = patient?.address
    ? [
        {
          type: "Present",
          address: patient.address,
          city: "N/A",
          state: "N/A",
          country: "N/A",
          "postal code": "N/A",
        },
      ]
    : [];

  // Prepare relationships data for table
  const relationshipsData = patient?.relationships?.map((rel) => ({
    name: rel.relativeName,
    relationship: rel.relationship,
    phone: rel.phone || "N/A",
  })) || [];

  // Prepare conditions data
  const conditionsData = [
    ...(patient?.previousConditions?.map((c) => ({
      type: "Previous",
      condition: c.conditionName,
      date: formatDate(c.diagnosedDate),
      notes: c.notes || "N/A",
    })) || []),
    ...(patient?.currentConditions?.map((c) => ({
      type: "Current",
      condition: c.conditionName,
      date: formatDate(c.diagnosedDate),
      notes: c.notes || "N/A",
    })) || []),
  ];

  // Prepare allergies data
  const allergiesData = patient?.allergies?.map((a) => ({
    allergen: a.reaction,
    severity: a.severity || "N/A",
    notes: a.reaction || "N/A",
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6 m-10">
        <p className="text-gray-500">Loading demographics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 m-10">
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 m-10">
      {patient && (
        <>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {patient.firstName} {patient.lastName}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {formatDate(patient.dateOfBirth)}
                </p>
                <p>
                  <strong>Gender:</strong> {patient.gender}
                </p>
                <p>
                  <strong>Phone:</strong> {patient.phone || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {patient.email || "N/A"}
                </p>
                <p>
                  <strong>Height:</strong> {patient.height ? `${patient.height} cm` : "N/A"}
                </p>
                <p>
                  <strong>Weight:</strong> {patient.weight ? `${patient.weight} kg` : "N/A"}
                </p>
                <p>
                  <strong>BMI:</strong> {patient.bmi || "N/A"}
                </p>
              </div>
            </div>

            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {patient.emergencyContact?.name || "N/A"}
                </p>
                <p>
                  <strong>Relationship:</strong> {patient.emergencyContact?.relationship || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {patient.emergencyContact?.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {addresses.length > 0 && (
            <>
              <p className="textSize-550 text-gray-primary font-semibold">Address</p>
              <TableField tableData={addresses} />
            </>
          )}

          {/* Relationships */}
          {relationshipsData.length > 0 && (
            <>
              <p className="textSize-550 text-gray-primary font-semibold">Relationships</p>
              <TableField
                tableData={relationshipsData.map((r) => ({
                  name: r.name,
                  relationship: r.relationship,
                  phone: r.phone,
                }))}
              />
            </>
          )}

          {/* Medical Conditions */}
          {conditionsData.length > 0 && (
            <>
              <p className="textSize-550 text-gray-primary font-semibold">Medical Conditions</p>
              <TableField tableData={conditionsData} />
            </>
          )}

          {/* Allergies */}
          {allergiesData.length > 0 && (
            <>
              <p className="textSize-550 text-gray-primary font-semibold">Allergies</p>
              <TableField tableData={allergiesData} />
            </>
          )}

          <hr />
          <div className="flex gap-4">
            <Link to={`/search-patient/patient-dashboard/${id}/overview`}>
              <Button
                text="Edit this patient"
                varientColor="primary"
                size="sm"
                Icon={FiEdit}
              />
            </Link>
            <Button
              text="Edit this patient (short form)"
              varientColor="primary"
              size="sm"
              Icon={FiEdit}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Demographics;