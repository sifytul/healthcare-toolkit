import * as React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Status type definitions
export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "cancelled"
  | "approved"
  | "rejected"
  | "draft"
  | "review"
  | "urgent"
  | "normal"
  | "critical";

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string;
  showDot?: boolean;
}

// Status configuration
const statusConfig: Record<string, { label: string; variant: BadgeProps["variant"]; dotColor?: string }> = {
  // Visit/Document statuses
  active: { label: "Active", variant: "default" as const, dotColor: "bg-green-500" },
  inactive: { label: "Inactive", variant: "secondary" as const, dotColor: "bg-gray-400" },
  completed: { label: "Completed", variant: "default" as const, dotColor: "bg-blue-500" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, dotColor: "bg-red-500" },
  
  // Review statuses
  pending: { label: "Pending", variant: "warning" as const, dotColor: "bg-yellow-500" },
  review: { label: "In Review", variant: "warning" as const, dotColor: "bg-yellow-500" },
  approved: { label: "Approved", variant: "default" as const, dotColor: "bg-green-500" },
  rejected: { label: "Rejected", variant: "destructive" as const, dotColor: "bg-red-500" },
  
  // Document statuses
  draft: { label: "Draft", variant: "secondary" as const, dotColor: "bg-gray-400" },
  published: { label: "Published", variant: "default" as const, dotColor: "bg-green-500" },
  
  // Medical statuses
  urgent: { label: "Urgent", variant: "destructive" as const, dotColor: "bg-red-500" },
  critical: { label: "Critical", variant: "destructive" as const, dotColor: "bg-red-500" },
  normal: { label: "Normal", variant: "default" as const, dotColor: "bg-green-500" },
  
  // Sensitivity statuses
  sensitive: { label: "Sensitive", variant: "default" as const, dotColor: "bg-green-500" },
  resistant: { label: "Resistant", variant: "destructive" as const, dotColor: "bg-red-500" },
  intermediate: { label: "Intermediate", variant: "warning" as const, dotColor: "bg-yellow-500" },
  
  // Gender
  male: { label: "Male", variant: "secondary" as const },
  female: { label: "Female", variant: "secondary" as const },
  other: { label: "Other", variant: "secondary" as const },
};

export function StatusBadge({ status, showDot = true, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)} {...props}>
      {showDot && config.dotColor && (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
      )}
      {config.label}
    </Badge>
  );
}

// Gender Badge
export function GenderBadge({ gender }: { gender: string }) {
  return <StatusBadge status={gender} showDot={false} />;
}

// Visit Status Badge
export function VisitStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} showDot />;
}

// Document Status Badge
export function DocumentStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} showDot />;
}

// Sensitivity Badge (S/I/R)
export function SensitivityBadge({ value }: { value: "S" | "I" | "R" | string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    S: { label: "Sensitive", variant: "default" as const },
    I: { label: "Intermediate", variant: "warning" as const },
    R: { label: "Resistant", variant: "destructive" as const },
  };

  const sensitivity = config[value.toUpperCase()] || { label: value, variant: "secondary" as const };

  return (
    <Badge variant={sensitivity.variant}>
      {value.toUpperCase()} - {sensitivity.label}
    </Badge>
  );
}

// Role Badge
export function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    doctor: { label: "Doctor", variant: "default" as const },
    patient: { label: "Patient", variant: "secondary" as const },
    diagnostic_center: { label: "Diagnostic Center", variant: "outline" as const },
    admin: { label: "Admin", variant: "destructive" as const },
  };

  const config = roleConfig[role] || { label: role, variant: "secondary" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Count Badge (for notifications, etc.)
export function CountBadge({ count, max = 99 }: { count: number; max?: number }) {
  if (count === 0) return null;

  return (
    <Badge variant="destructive" className="h-5 min-w-5 px-1.5 flex items-center justify-center">
      {count > max ? `${max}+` : count}
    </Badge>
  );
}