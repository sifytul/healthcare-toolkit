import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Search, Filter, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";

const API_URL = "http://localhost:7000/api/v1/reviews";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Status badge helper
const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "warning" | "outline" }> = {
    pending: { label: "Pending", variant: "warning" },
    in_review: { label: "In Review", variant: "warning" },
    approved: { label: "Approved", variant: "default" },
    rejected: { label: "Rejected", variant: "destructive" },
    revision_requested: { label: "Revision Requested", variant: "outline" },
  };
  return config[status] || { label: status, variant: "secondary" };
};

// Priority badge helper
const getPriorityBadge = (priority: string) => {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "warning" }> = {
    routine: { label: "Routine", variant: "secondary" },
    urgent: { label: "Urgent", variant: "warning" },
    critical: { label: "Critical", variant: "destructive" },
  };
  return config[priority] || { label: priority, variant: "secondary" };
};

// Review level display
const getReviewLevelLabel = (level: string) => {
  const labels: Record<string, string> = {
    general_physician: "General Physician",
    specialist: "Specialist",
    consultant: "Consultant",
    final: "Final",
  };
  return labels[level] || level;
};

const ReviewsList = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    reviewLevel: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(pagination.limit));

      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.reviewLevel) params.append("reviewLevel", filters.reviewLevel);

      const response = await fetch(`${API_URL}?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      setReviews(data.data.reviews);
      setPagination({
        ...pagination,
        page: data.data.pagination.page,
        total: data.data.pagination.total,
        pages: data.data.pagination.pages,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const handlePageChange = (page: number) => {
    fetchReviews(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Reviews"
        description="Manage and review diagnosis requests"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Reviews</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="revision_requested">Revision Requested</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => handleFilterChange("priority", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.reviewLevel}
                onValueChange={(value) => handleFilterChange("reviewLevel", value)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="general_physician">General Physician</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => {
                  const statusConfig = getStatusBadge(review.status);
                  const priorityConfig = getPriorityBadge(review.priority);

                  return (
                    <TableRow key={review._id}>
                      <TableCell className="font-medium">
                        {review.patient?.firstName} {review.patient?.lastName}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {review.patient?.patientId}
                        </span>
                      </TableCell>
                      <TableCell>
                        {review.diagnosis?.icdCode}
                        <br />
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {review.diagnosis?.description}
                        </span>
                      </TableCell>
                      <TableCell>{review.requestedBy?.fullName || "Unknown"}</TableCell>
                      <TableCell>{getReviewLevelLabel(review.reviewLevel)}</TableCell>
                      <TableCell>
                        <Badge variant={priorityConfig.variant}>
                          {priorityConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/reviews/${review._id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && reviews.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={pagination.page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                      className="w-8 h-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsList;