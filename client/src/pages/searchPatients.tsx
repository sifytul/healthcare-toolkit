import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { PatientSearch } from "@/components/patterns/PatientSearch";

const API_URL = "http://localhost:7000/api/v1/patients";

const SearchPatients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const searchPatients = async (term: string) => {
    if (!term.trim()) {
      setPatients([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(term)}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch patients");
      }

      // Transform _id to patientId for PatientSearch component
      const transformedPatients = (data.data?.patients || []).map((p: any) => ({
        ...p,
        patientId: p.patientId || p._id,
      }));
      setPatients(transformedPatients);
    } catch (err: any) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPatients(searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Search Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <PatientSearch
            patients={patients}
            loading={loading}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            patientDashboardBasePath="/search-patient/patient-dashboard"
            emptyMessage="Enter a name, patient ID, or phone number to search"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchPatients;
