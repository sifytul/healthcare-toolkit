import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText, Plus, Search, Download, Eye, Building2, User } from "lucide-react";

const API_URL = "http://localhost:7000/api/v1/reports";

interface RadiologyReport {
  _id: string;
  reportType: string;
  radiology?: {
    studyType: string;
    findings: string;
    impressions?: string;
    reportDate: string;
    reportFileUrl?: string;
    performedBy?: string;
    reviewedBy?: string;
  };
  patient: {
    _id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  uploadedBy?: {
    fullName: string;
  };
}

const studyTypes = [
  { value: "xray", label: "X-Ray" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "mri", label: "MRI" },
  { value: "ecg", label: "ECG/EKG" },
  { value: "echo", label: "Echocardiogram" },
  { value: "other", label: "Other" },
];

const Radiology = () => {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<RadiologyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<RadiologyReport | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    studyType: "",
    findings: "",
    impressions: "",
    reportDate: "",
    performedBy: "",
    reviewedBy: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    fetchReports();
  }, [id]);

  const fetchReports = async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/patient/${id}?reportType=radiology`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch radiology reports");
      }

      const data = await response.json();
      setReports(data.data.reports || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patient: id,
          reportType: "radiology",
          radiology: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create radiology report");
      }

      setIsDialogOpen(false);
      setFormData({
        studyType: "",
        findings: "",
        impressions: "",
        reportDate: "",
        performedBy: "",
        reviewedBy: "",
      });
      fetchReports();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

  const getStudyTypeLabel = (value: string) => {
    return studyTypes.find((type) => type.value === value)?.label || value;
  };

  const filteredReports = reports.filter((report) =>
    report.radiology?.studyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.radiology?.findings.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && reports.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Radiology Reports</h2>
          <p className="text-gray-500">View and manage patient radiology reports</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Radiology Report</DialogTitle>
                <DialogDescription>
                  Enter the radiology report details for this patient.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studyType">Study Type</Label>
                    <Select
                      value={formData.studyType}
                      onValueChange={(value) => setFormData({ ...formData, studyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select study type" />
                      </SelectTrigger>
                      <SelectContent>
                        {studyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportDate">Report Date</Label>
                    <Input
                      id="reportDate"
                      type="date"
                      value={formData.reportDate}
                      onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    placeholder="Enter findings..."
                    rows={4}
                    value={formData.findings}
                    onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impressions">Impressions</Label>
                  <Textarea
                    id="impressions"
                    placeholder="Enter impressions..."
                    rows={3}
                    value={formData.impressions}
                    onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="performedBy">Performed By</Label>
                    <Input
                      id="performedBy"
                      placeholder="Technician name"
                      value={formData.performedBy}
                      onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewedBy">Reviewed By</Label>
                    <Input
                      id="reviewedBy"
                      placeholder="Radiologist name"
                      value={formData.reviewedBy}
                      onChange={(e) => setFormData({ ...formData, reviewedBy: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
                  {loading ? "Saving..." : "Save Report"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search reports..."
          className="pl-10 max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No radiology reports found</p>
            <Button
              variant="link"
              onClick={() => setIsDialogOpen(true)}
              className="text-orange-500"
            >
              Add your first report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card key={report._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {getStudyTypeLabel(report.radiology?.studyType || "")}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.radiology?.reportDate || report.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Findings</p>
                    <p className="text-sm mt-1 line-clamp-2">{report.radiology?.findings}</p>
                  </div>
                  {report.radiology?.impressions && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Impressions</p>
                      <p className="text-sm mt-1">{report.radiology?.impressions}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-500">
                    {report.radiology?.performedBy && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.radiology.performedBy}
                      </div>
                    )}
                    {report.radiology?.reviewedBy && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {report.radiology.reviewedBy}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {report.radiology?.reportFileUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  {getStudyTypeLabel(selectedReport.radiology?.studyType || "")}
                </DialogTitle>
                <DialogDescription>
                  Report Date: {formatDate(selectedReport.radiology?.reportDate || selectedReport.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <p className="font-medium text-gray-500 mb-1">Findings</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.radiology?.findings}</p>
                </div>
                {selectedReport.radiology?.impressions && (
                  <div>
                    <p className="font-medium text-gray-500 mb-1">Impressions</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.radiology?.impressions}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {selectedReport.radiology?.performedBy && (
                    <div>
                      <p className="text-sm text-gray-500">Performed By</p>
                      <p className="text-sm font-medium">{selectedReport.radiology.performedBy}</p>
                    </div>
                  )}
                  {selectedReport.radiology?.reviewedBy && (
                    <div>
                      <p className="text-sm text-gray-500">Reviewed By</p>
                      <p className="text-sm font-medium">{selectedReport.radiology.reviewedBy}</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                {selectedReport.radiology?.reportFileUrl && (
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Radiology;