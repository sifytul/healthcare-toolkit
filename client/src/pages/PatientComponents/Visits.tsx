import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/shared/Button";
import SearchField from "../../components/shared/SearchField";
import TableField from "../../components/shared/TableField";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Visit {
  _id: string;
  department: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  status: string;
  doctor?: {
    fullName: string;
  };
}

const Visits = () => {
  const { id } = useParams<{ id: string }>();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [searchedText, setSearchedText] = useState("");
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
    const fetchVisits = async () => {
      if (!id) return;

      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const data = await response.json();
        setVisits(data.data.patient.visits || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [id]);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(e.target.value);
  };

  // Filter visits based on search
  const filteredVisits = visits.filter(
    (visit) =>
      visit.department.toLowerCase().includes(searchedText.toLowerCase()) ||
      visit.diagnosis?.toLowerCase().includes(searchedText.toLowerCase()) ||
      visit.reason?.toLowerCase().includes(searchedText.toLowerCase())
  );

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

  // Transform data for table display
  const tableData = filteredVisits.map((visit) => ({
    visit: visit.department,
    encounter: "View",
    encounterDate: formatDate(visit.startDate),
    encounterType: visit.reason || "General Visit",
    providers: visit.doctor?.fullName || "N/A",
    location: visit.department,
    status: visit.status,
  }));

  if (loading) {
    return (
      <div className="space-y-6 m-10">
        <p className="text-gray-500">Loading visits...</p>
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
      <SearchField
        placeholder="Search visits"
        value={searchedText}
        changeHandler={changeHandler}
      />
      <TableField tableData={tableData} />
      <Button text="+ Add Visit" varientColor="primary" size="sm" />
    </div>
  );
};

export default Visits;