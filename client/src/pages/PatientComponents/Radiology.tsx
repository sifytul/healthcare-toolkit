import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Search, FileText, Calendar, Eye } from "lucide-react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:7000/api/v1/reports";

interface Report {
  _id: string;
  patientId: string;
  reportType: "xray" | "mri" | "ct" | "ultrasound" | "other";
  description: string;
  findings?: string;
  impressions?: string;
  status: "pending" | "completed" | "reviewed";
  date: string;
  uploadedBy?: string;
  imageUrl?: string;
}

const Radiology = () => {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredReports = reports.filter((report) =>
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Button size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Upload Report
        </Button>
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
                    {getReportTypeIcon(report.reportType)}
                    <CardTitle className="text-base">
                      {getReportTypeLabel(report.reportType)}
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
                  {new Date(report.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{report.description}</p>

                {report.findings && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Findings:</p>
                    <p className="text-sm text-muted-foreground">{report.findings}</p>
                  </div>
                )}

                {report.impressions && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Impressions:</p>
                    <p className="text-sm text-muted-foreground">{report.impressions}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {report.imageUrl && (
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Image
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Radiology;
