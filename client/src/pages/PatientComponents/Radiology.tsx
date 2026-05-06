import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Search, FileText, Calendar, Eye, Download, Upload, X } from "lucide-react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:7000/api/v1/reports";

interface Report {
  _id: string;
  patient: string;
  reportType: string;
  radiology?: {
    reportType?: string;
    description?: string;
    findings?: string;
    impressions?: string;
    status?: string;
    reportFileUrl?: string;
  };
  status: string;
  createdAt: string;
  uploadedBy?: {
    fullName: string;
  };
}

const Radiology = () => {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);

  // Form state for new radiology report
  const [reportType, setReportType] = useState<string>("xray");
  const [description, setDescription] = useState("");
  const [findings, setFindings] = useState("");
  const [impressions, setImpressions] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!id) return;

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_URL}?patientId=${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch radiology reports");
        }

        const data = await response.json();
        setReports(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [id]);

  const getReportTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      xray: "X-Ray",
      mri: "MRI",
      ct: "CT Scan",
      ultrasound: "Ultrasound",
      other: "Other",
    };
    return labels[type] || type;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setUploading(true);
    try {
      // First create the report without file
      const reportResponse = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patient: id,
          reportType: "radiology",
          radiology: {
            reportType,
            description,
            findings,
            impressions,
            status: "pending",
          },
        }),
      });

      if (!reportResponse.ok) {
        throw new Error("Failed to create report");
      }

      const data = await reportResponse.json();
      const reportId = data.data.report._id;

      // If file selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("reportType", "radiology");

        await fetch(`${API_URL}/${reportId}/upload`, {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
          body: formData,
        });
      }

      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription("");
      setFindings("");
      setImpressions("");
      setReportType("xray");
      fetchReports(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      const response = await fetch(`${API_URL}/${report._id}/download`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const data = await response.json();
      if (data.data.fileUrl) {
        // Open the file URL in new tab or download
        window.open(`http://localhost:7000${data.data.fileUrl}`, "_blank");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleViewImage = async (report: Report) => {
    try {
      const response = await fetch(`${API_URL}/${report._id}/download`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to get image URL");
      }

      const data = await response.json();
      if (data.data.fileUrl) {
        setViewingImageUrl(`http://localhost:7000${data.data.fileUrl}`);
        setIsImageViewerOpen(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const filteredReports = reports.filter((report) =>
    report.radiology?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.radiology?.reportType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Radiology Reports</h2>
          <p className="text-sm text-muted-foreground">
            View and manage radiology imaging reports
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleUpload}>
              <DialogHeader>
                <DialogTitle>Upload Radiology Report</DialogTitle>
                <DialogDescription>Upload a new radiology imaging report for this patient.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xray">X-Ray</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="ct">CT Scan</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the imaging"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Findings</Label>
                  <Input
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Radiologist findings"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impressions</Label>
                  <Input
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    placeholder="Clinical impressions"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upload File (Optional)</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {selectedFile.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Report"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reports..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredReports.length === 0 ? (
        <Card className="p-8">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No radiology reports found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Try a different search term" : "Upload a report to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <Card key={report._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getReportTypeIcon(report.radiology?.reportType || report.reportType)}
                    <CardTitle className="text-base">
                      {getReportTypeLabel(report.radiology?.reportType || report.reportType)}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(report.status)}
                  >
                    {report.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{report.radiology?.description}</p>

                {report.radiology?.findings && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Findings:</p>
                    <p className="text-sm text-muted-foreground">{report.radiology?.findings}</p>
                  </div>
                )}

                {report.radiology?.impressions && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Impressions:</p>
                    <p className="text-sm text-muted-foreground">{report.radiology?.impressions}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {report.radiology?.reportFileUrl && (
                    <Button variant="outline" size="sm" onClick={() => handleViewImage(report)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Image
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Radiology Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {viewingImageUrl && (
              <img
                src={viewingImageUrl}
                alt="Radiology report"
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageViewerOpen(false)}>
              Close
            </Button>
            {viewingImageUrl && (
              <Button onClick={() => window.open(viewingImageUrl, "_blank")}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Radiology;
