import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
}

interface Visit {
  date: string;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  notes?: string;
}

const Graphs = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      try {
        // Fetch patient
        const patientRes = await fetch(`${API_URL}/${id}`, { headers });
        if (!patientRes.ok) throw new Error("Failed to fetch patient");
        const patientData = await patientRes.json();
        setPatient(patientData.data.patient);

        // Fetch visits for charts
        const visitsRes = await fetch(`${API_URL}/${id}/visits`, { headers });
        if (!visitsRes.ok) throw new Error("Failed to fetch visits");
        const visitsData = await visitsRes.json();
        setVisits(visitsData.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4 p-4 border-destructive/50 bg-destructive/10">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <h2 className="text-lg font-semibold">
        Patient History - {patient?.firstName} {patient?.lastName}
      </h2>

      {visits.length === 0 ? (
        <Card className="p-8">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-muted-foreground">No visit history available</p>
            <p className="text-sm text-muted-foreground">Visits will appear here once recorded</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blood Pressure Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure Trend</CardTitle>
              <CardDescription>Last 5 visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visits.slice(0, 5).map((visit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      {new Date(visit.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-4">
                      {visit.bloodPressure ? (
                        <>
                          <div className="text-center">
                            <div className="text-sm font-medium">{visit.bloodPressure.systolic}</div>
                            <div className="text-xs text-muted-foreground">Systolic</div>
                          </div>
                          <span className="text-muted-foreground">/</span>
                          <div className="text-center">
                            <div className="text-sm font-medium">{visit.bloodPressure.diastolic}</div>
                            <div className="text-xs text-muted-foreground">Diastolic</div>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate Trend</CardTitle>
              <CardDescription>Last 5 visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visits.slice(0, 5).map((visit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      {new Date(visit.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">
                      {visit.heartRate ? `${visit.heartRate} bpm` : "No data"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weight Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Trend</CardTitle>
              <CardDescription>Last 5 visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visits.slice(0, 5).map((visit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      {new Date(visit.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">
                      {visit.weight ? `${visit.weight} kg` : "No data"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Temperature Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Temperature Trend</CardTitle>
              <CardDescription>Last 5 visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visits.slice(0, 5).map((visit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      {new Date(visit.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">
                      {visit.temperature ? `${visit.temperature} degreesC` : "No data"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Graphs;
