import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertCircle, Plus } from "lucide-react";

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Recent visits (last 5)
  const recentVisits = patient?.visits?.slice(-5).reverse() || [];

  // Medications
  const medications = patient?.medications || [];

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
      {/* Patient Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Patient Actions</h3>
            {patient?.visits?.some((v) => v.status === "active") ? (
              <Badge variant="default" className="bg-green-600">Active visit in progress</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">No active visit</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Recent Visits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Visits</h3>
        {recentVisits.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVisits.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>{v.department}</TableCell>
                    <TableCell>{formatDate(v.startDate)}</TableCell>
                    <TableCell>{formatDate(v.endDate || "")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(v.status)}>
                        {v.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No visits found</p>
        )}
      </div>

      <Separator />

      {/* Programs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Programs</h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">No programs enrolled</p>
      </div>

      <Separator />

      {/* Relationships */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Relationships</h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Relationship
          </Button>
        </div>
        {patient?.relationships && patient.relationships.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relative</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.relationships.map((rel) => (
                  <TableRow key={rel._id}>
                    <TableCell>{rel.relativeName}</TableCell>
                    <TableCell>{rel.relationship}</TableCell>
                    <TableCell>{formatDate(rel.startDate)}</TableCell>
                    <TableCell>{formatDate(rel.endDate || "")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No relationships found</p>
        )}
      </div>

      {/* Medications */}
      {medications.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Medications</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((med) => (
                    <TableRow key={med._id}>
                      <TableCell className="font-medium">{med.medicationName}</TableCell>
                      <TableCell>{med.dosage || "N/A"}</TableCell>
                      <TableCell>{med.frequency || "N/A"}</TableCell>
                      <TableCell>{formatDate(med.startDate)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(med.status)}>
                          {med.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
