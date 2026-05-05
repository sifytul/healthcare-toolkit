import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  actions?: {
    label?: string;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    customActions?: { label: string; onClick: (row: T) => void }[];
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
    onSort: (key: string) => void;
  };
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = "id" as keyof T,
  loading = false,
  emptyMessage = "No data available",
  actions,
  pagination,
  sortConfig,
  className,
}: DataTableProps<T>) {
  const getKey = (row: T): string => {
    const key = row[keyField];
    return typeof key === "string" || typeof key === "number" ? String(key) : Math.random().toString();
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig) return null;
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
              {actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full border rounded-md p-8 text-center text-muted-foreground", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(col.sortable && "cursor-pointer select-none hover:bg-muted/50", col.className)}
                onClick={() => col.sortable && sortConfig?.onSort(col.key)}
              >
                <div className="flex items-center">
                  {col.label}
                  {col.sortable && renderSortIcon(col.key)}
                </div>
              </TableHead>
            ))}
            {actions && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                </TableCell>
              ))}
              {actions && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {actions.onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => actions.onView?.(row)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                    {actions.onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => actions.onEdit?.(row)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    {actions.onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => actions.onDelete?.(row)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    {actions.customActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.customActions.map((action, i) => (
                            <DropdownMenuItem
                              key={i}
                              onClick={() => action.onClick(row)}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }).map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => pagination.onPageChange(i + 1)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format status badges
export function StatusBadge({ status, variant = "default" }: { status: string; variant?: "default" | "success" | "warning" | "destructive" }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
    active: { label: "Active", variant: "success" },
    inactive: { label: "Inactive", variant: "secondary" },
    completed: { label: "Completed", variant: "default" },
    pending: { label: "Pending", variant: "warning" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  const config = statusConfig[status.toLowerCase()] || { label: status, variant: "default" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}