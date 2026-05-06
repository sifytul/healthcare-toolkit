import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertCircle, Plus, UserPlus, Pill, X } from "lucide-react";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  allergies: Array<{
    allergen: string;
    reaction?: string;
    severity?: string;
  }>;
  previousConditions: Array<{
    conditionName: string;
    diagnosedDate?: string;
    notes?: string;
  }>;
  currentConditions: Array<{
    conditionName: string;
    diagnosedDate?: string;
    notes?: string;
  }>;
  relationships: Array<{
    _id: string;
    relativeName: string;
    relationship: string;
    phone?: string;
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
    reason?: string;
    diagnosis?: string;
  }>;
}

interface RelationshipFormData {
  relativeName: string;
  relationship: string;
  phone: string;
  startDate: string;
}

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const initialRelationshipData: RelationshipFormData = {
  relativeName: "",
  relationship: "",
  phone: "",
  startDate: new Date().toISOString().split("T")[0],
};

const initialMedicationData: MedicationFormData = {
  medicationName: "",
  dosage: "",
  frequency: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  notes: "",
};

const Overview = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [relationshipForm, setRelationshipForm] = useState<RelationshipFormData>(initialRelationshipData);
  const [medicationForm, setMedicationForm] = useState<MedicationFormData>(initialMedicationData);

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

  const getSeverityBadgeVariant = (severity?: string) => {
    switch (severity) {
      case "severe":
        return "destructive";
      case "moderate":
        return "default";
      case "mild":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Handle relationship form submit
  const handleRelationshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !relationshipForm.relativeName || !relationshipForm.relationship) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/${id}/relationships`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(relationshipForm),
      });

      if (!response.ok) {
        throw new Error("Failed to add relationship");
      }

      const data = await response.json();
      setPatient((prev) => prev ? {
        ...prev,
        relationships: [...prev.relationships, data.data.relationship]
      } : null);
      setIsRelationshipDialogOpen(false);
      setRelationshipForm(initialRelationshipData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle medication form submit
  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !medicationForm.medicationName) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/${id}/medications`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(medicationForm),
      });

      if (!response.ok) {
        throw new Error("Failed to add medication");
      }

      const data = await response.json();
      setPatient((prev) => prev ? {
        ...prev,
        medications: [...prev.medications, data.data.medication]
      } : null);
      setIsMedicationDialogOpen(false);
      setMedicationForm(initialMedicationData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
            <h3 className="text-lg font-semibold">Patient Status</h3>
            {patient?.visits?.some((v) => v.status === "active") ? (
              <Badge variant="default" className="bg-green-600">Active visit in progress</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">No active visit</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Allergies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Allergies</h3>
        {patient?.allergies && patient.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy, index) => (
              <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {allergy.allergen}
                {allergy.reaction && ` - ${allergy.reaction}`}
                {allergy.severity && ` (${allergy.severity})`}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No known allergies</p>
        )}
      </div>

      <Separator />

      {/* Current Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Conditions</h3>
        {patient?.currentConditions && patient.currentConditions.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Condition</TableHead>
                  <TableHead>Diagnosed Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.currentConditions.map((condition, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{condition.conditionName}</TableCell>
                    <TableCell>{formatDate(condition.diagnosedDate || "")}</TableCell>
                    <TableCell>{condition.notes || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No current conditions</p>
        )}
      </div>

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
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVisits.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell className="font-medium">{v.department}</TableCell>
                    <TableCell>{v.reason || "General Visit"}</TableCell>
                    <TableCell>{formatDate(v.startDate)}</TableCell>
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

      {/* Relationships */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Relationships</h3>
          <Dialog open={isRelationshipDialogOpen} onOpenChange={setIsRelationshipDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Relationship
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleRelationshipSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Relationship</DialogTitle>
                  <DialogDescription>Add a family member or caregiver to this patient record.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={relationshipForm.relativeName}
                      onChange={(e) => setRelationshipForm({ ...relationshipForm, relativeName: e.target.value })}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Select
                      value={relationshipForm.relationship}
                      onValueChange={(value) => setRelationshipForm({ ...relationshipForm, relationship: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={relationshipForm.phone}
                      onChange={(e) => setRelationshipForm({ ...relationshipForm, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsRelationshipDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {patient?.relationships && patient.relationships.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.relationships.map((rel) => (
                  <TableRow key={rel._id}>
                    <TableCell className="font-medium">{rel.relativeName}</TableCell>
                    <TableCell className="capitalize">{rel.relationship}</TableCell>
                    <TableCell>{rel.phone || "N/A"}</TableCell>
                    <TableCell>{formatDate(rel.startDate)}</TableCell>
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Medications</h3>
              <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Pill className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleMedicationSubmit}>
                    <DialogHeader>
                      <DialogTitle>Add Medication</DialogTitle>
                      <DialogDescription>Add a new medication to this patient's record.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Medication Name</Label>
                        <Input
                          value={medicationForm.medicationName}
                          onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })}
                          placeholder="Enter medication name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Dosage</Label>
                          <Input
                            value={medicationForm.dosage}
                            onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Input
                            value={medicationForm.frequency}
                            onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={medicationForm.startDate}
                            onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date (Optional)</Label>
                          <Input
                            type="date"
                            value={medicationForm.endDate}
                            onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input
                          value={medicationForm.notes}
                          onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                          placeholder="Additional notes"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsMedicationDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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

      {/* Show Add Medication button even if no medications exist */}
      {medications.length === 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Medications</h3>
              <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Pill className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleMedicationSubmit}>
                    <DialogHeader>
                      <DialogTitle>Add Medication</DialogTitle>
                      <DialogDescription>Add a new medication to this patient's record.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Medication Name</Label>
                        <Input
                          value={medicationForm.medicationName}
                          onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })}
                          placeholder="Enter medication name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Dosage</Label>
                          <Input
                            value={medicationForm.dosage}
                            onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Input
                            value={medicationForm.frequency}
                            onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={medicationForm.startDate}
                            onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date (Optional)</Label>
                          <Input
                            type="date"
                            value={medicationForm.endDate}
                            onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input
                          value={medicationForm.notes}
                          onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                          placeholder="Additional notes"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsMedicationDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">No medications on record</p>
          </div>
        </>
      )}

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
