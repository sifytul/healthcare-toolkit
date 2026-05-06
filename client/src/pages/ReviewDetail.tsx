import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Clock, User, Calendar, FileText, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { InfoCard } from "@/components/patterns/PageHeader";

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

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch review");
        }

        setReview(data.data.review);
        setDecisionNotes(data.data.review.decisionNotes || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    if (!id) return;

    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status,
          decisionNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update review status");
      }

      // Refresh the review data
      setReview(data.data.review);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!id || !comment.trim()) return;

    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment: comment.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      // Refresh the review data
      const refreshResponse = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      const refreshData = await refreshResponse.json();
      setReview(refreshData.data.review);
      setComment("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <PageHeader
          title="Review Details"
          backHref="/reviews"
        />
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-4 w-full bg-muted animate-pulse rounded mb-4" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="container mx-auto py-6 px-4">
        <PageHeader
          title="Review Details"
          backHref="/reviews"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!review) return null;

  const statusConfig = getStatusBadge(review.status);
  const priorityConfig = getPriorityBadge(review.priority);

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Review Details"
        backHref="/reviews"
        badge={statusConfig.label}
        badgeVariant={statusConfig.variant}
      />

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {review.patient?.firstName} {review.patient?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{review.patient?.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{review.patient?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{review.patient?.email || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Diagnosis Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ICD Code</p>
                  <p className="font-medium">{review.diagnosis?.icdCode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <p className="font-medium">{review.diagnosis?.severity || "N/A"}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{review.diagnosis?.description || "N/A"}</p>
              </div>
              {review.diagnosis?.notes && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{review.diagnosis.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Request Notes */}
          {review.requestNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Review Request Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{review.requestNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Decision Notes */}
          {review.decisionNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Decision Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{review.decisionNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {review.comments && review.comments.length > 0 ? (
                <div className="space-y-4">
                  {review.comments.map((comment: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm mt-1">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No comments yet</p>
              )}

              <div className="pt-4 border-t">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-2"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || actionLoading}
                >
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Review Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge variant={priorityConfig.variant}>{priorityConfig.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Review Level</span>
                <span className="font-medium">{getReviewLevelLabel(review.reviewLevel)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="font-medium">v{review.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Requested By</span>
                <span className="font-medium">{review.requestedBy?.fullName || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Requested On</span>
                <span className="font-medium text-sm">{formatDate(review.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Reviewers */}
          {review.reviewers && review.reviewers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reviewers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {review.reviewers.map((reviewer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {reviewer.user?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getReviewLevelLabel(reviewer.level)}
                      </p>
                    </div>
                    <Badge
                      variant={reviewer.status === "approved" ? "default" : reviewer.status === "rejected" ? "destructive" : "secondary"}
                    >
                      {reviewer.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {review.status !== "approved" && review.status !== "rejected" && (
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
                <CardDescription>
                  Update the review status and add decision notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Decision Notes
                  </label>
                  <Textarea
                    placeholder="Add notes about your decision..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleStatusUpdate("revision_requested")}
                    disabled={actionLoading}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Request Revision
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={actionLoading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;