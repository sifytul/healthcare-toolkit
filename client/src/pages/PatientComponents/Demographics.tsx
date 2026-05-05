import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Edit, Save } from "lucide-react";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Patient {
  patientId: string;
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
  bloodType?: string;
  emergencyContact?: {
    name: string;
    relationship?: string;
    phone?: string;
  };
}

const Demographics = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  if (!patient) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Demographics</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input value={`${patient.firstName} ${patient.lastName}`} readOnly={!isEditing} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Patient ID</Label>
              <Input value={patient.patientId} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date of Birth</Label>
              <Input value={formatDate(patient.dateOfBirth)} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Age</Label>
              <Input value={`${calculateAge(patient.dateOfBirth)} years`} readOnly />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Gender</Label>
              <Input 
                value={patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "N/A"} 
                readOnly 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Blood Type</Label>
              <Input value={patient.bloodType || "Not specified"} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={patient.phone || "N/A"} readOnly={!isEditing} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={patient.email || "N/A"} readOnly={!isEditing} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input value={patient.address || "N/A"} readOnly={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Measurements */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Physical Measurements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Height</Label>
              <Input 
                value={patient.height ? `${patient.height} cm` : "N/A"} 
                readOnly={!isEditing} 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Weight</Label>
              <Input 
                value={patient.weight ? `${patient.weight} kg` : "N/A"} 
                readOnly={!isEditing} 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">BMI</Label>
              <Input value={patient.bmi ? patient.bmi.toFixed(1) : "N/A"} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input 
                value={patient.emergencyContact?.name || "Not specified"} 
                readOnly={!isEditing} 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Relationship</Label>
              <Input 
                value={patient.emergencyContact?.relationship || "Not specified"} 
                readOnly={!isEditing} 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input 
                value={patient.emergencyContact?.phone || "Not specified"} 
                readOnly={!isEditing} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demographics;
