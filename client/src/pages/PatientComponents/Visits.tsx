import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Search, Loader2, AlertCircle, Plus } from "lucide-react";

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

interface VisitFormData {
  department: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  startDate: string;
}

const initialVisitData: VisitFormData = {
  department: "",
  reason: "",
  diagnosis: "",
  treatment: "",
  startDate: new Date().toISOString().split("T")[0],
};

const Visits = () => {
  const { id } = useParams<{ id: string }>();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [searchedText, setSearchedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isAddVisitDialogOpen, setIsAddVisitDialogOpen] = useState(false);
  const [visitForm, setVisitForm] = useState<VisitFormData>(initialVisitData);

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

  // Handle add visit submit
  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !visitForm.department) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/${id}/visits`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(visitForm),
      });

      if (!response.ok) {
        throw new Error("Failed to add visit");
      }

      const data = await response.json();
      setVisits((prev) => [...prev, data.data.visit]);
      setIsAddVisitDialogOpen(false);
      setVisitForm(initialVisitData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search visits..."
          value={searchedText}
          onChange={changeHandler}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchedText ? "No visits match your search" : "No visits found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredVisits.map((visit) => (
                <TableRow key={visit._id}>
                  <TableCell className="font-medium">{visit.department}</TableCell>
                  <TableCell>{formatDate(visit.startDate)}</TableCell>
                  <TableCell>{visit.reason || "General Visit"}</TableCell>
                  <TableCell>{visit.doctor?.fullName || "N/A"}</TableCell>
                  <TableCell>{visit.diagnosis || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(visit.status)}>
                      {visit.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Visit Button with Dialog */}
      <div className="flex justify-end">
        <Dialog open={isAddVisitDialogOpen} onOpenChange={setIsAddVisitDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Visit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddVisit}>
              <DialogHeader>
                <DialogTitle>Add New Visit</DialogTitle>
                <DialogDescription>Record a new visit for this patient.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={visitForm.department}
                    onValueChange={(value) => setVisitForm({ ...visitForm, department: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                      <SelectItem value="ENT">ENT</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Visit</Label>
                  <Input
                    value={visitForm.reason}
                    onChange={(e) => setVisitForm({ ...visitForm, reason: e.target.value })}
                    placeholder="e.g., Annual checkup"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input
                    value={visitForm.diagnosis}
                    onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                    placeholder="Initial diagnosis"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Treatment</Label>
                  <Input
                    value={visitForm.treatment}
                    onChange={(e) => setVisitForm({ ...visitForm, treatment: e.target.value })}
                    placeholder="Prescribed treatment"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={visitForm.startDate}
                    onChange={(e) => setVisitForm({ ...visitForm, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddVisitDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Visit"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Visits;
