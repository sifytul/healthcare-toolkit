import * as React from "react";
import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "./DataTable";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Helper functions defined outside component to avoid recreation on every render
const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return "N/A";
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return String(age);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
}

interface PatientSearchProps {
  patients: Patient[];
  loading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  columns?: Column<Patient>[];
  onPatientClick?: (patient: Patient) => void;
  patientDashboardBasePath?: string;
  showResultsCount?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function PatientSearch({
  patients,
  loading = false,
  searchValue,
  onSearchChange,
  columns,
  onPatientClick,
  patientDashboardBasePath = "/search-patient/patient-dashboard",
  showResultsCount = true,
  emptyMessage = "Start typing to search patients",
  className,
}: PatientSearchProps) {
  // Default columns memoized with patientDashboardBasePath dependency
  const defaultColumns = useMemo<Column<Patient>[]>(() => [
    {
      key: "patientId",
      label: "ID",
      sortable: true,
      render: (row) => (
        <Link
          to={`${patientDashboardBasePath}/${row.patientId}`}
          className="text-primary hover:underline font-medium"
        >
          {row.patientId}
        </Link>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      sortable: true,
      render: (row) => (
        <Link
          to={`${patientDashboardBasePath}/${row.patientId}`}
          className="text-primary hover:underline font-medium"
        >
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    {
      key: "age",
      label: "Age",
      sortable: true,
      render: (row) => {
        const age = calculateAge(row.dateOfBirth);
        return <span>{age}</span>;
      },
    },
    {
      key: "gender",
      label: "Gender",
      sortable: true,
      render: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      sortable: true,
      render: (row) => formatDate(row.dateOfBirth),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || "N/A",
    },
  ], [patientDashboardBasePath]);

  const displayColumns = columns || defaultColumns;

  // Only pass actions if onPatientClick is provided, otherwise omit actions entirely
  const tableActions = onPatientClick
    ? { onView: onPatientClick }
    : undefined;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by patient ID or name..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Count */}
      {showResultsCount && searchValue && (
        <p className="text-sm text-muted-foreground text-right">
          Found <strong>{patients.length}</strong> patient{patients.length !== 1 ? "s" : ""} for "{searchValue}"
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading patients...</div>
        </div>
      )}

      {/* Empty State - Initial */}
      {!loading && !searchValue && (
        <Card className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </Card>
      )}

      {/* Empty State - No Results */}
      {!loading && searchValue && patients.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">No patients found for "{searchValue}"</p>
        </Card>
      )}

      {/* Results Table */}
      {!loading && patients.length > 0 && (
        <Card className="overflow-hidden">
          <DataTable
            columns={displayColumns}
            data={patients}
            keyField="patientId"
            actions={tableActions}
          />
        </Card>
      )}
    </div>
  );
}

// Compact version for inline use
interface PatientSearchCompactProps {
  patients: Patient[];
  loading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onPatientSelect: (patient: Patient) => void;
  placeholder?: string;
  className?: string;
}

export function PatientSearchCompact({
  patients,
  loading = false,
  searchValue,
  onSearchChange,
  onPatientSelect,
  placeholder = "Search patients...",
  className,
}: PatientSearchCompactProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Dropdown results */}
      {searchValue && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">Loading...</div>
          ) : patients.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">No patients found</div>
          ) : (
            patients.slice(0, 10).map((patient) => (
              <button
                key={patient.patientId}
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                onClick={() => onPatientSelect(patient)}
              >
                <div className="font-medium">
                  {patient.firstName} {patient.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {patient.patientId} - {patient.gender}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}