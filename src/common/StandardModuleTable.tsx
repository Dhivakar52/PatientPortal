import { useState, useMemo, useRef, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CalendarIcon,
  ArrowRight,
  SlidersHorizontal,
  FileSpreadsheet,
  Printer,
  Filter,
  Loader2,
  X,
  Plus,
  UsersRound,
  UserPlus,
  // RotateCcw,
  Stethoscope,
  Ban,
  CalendarClock,
  Baby,
  Building2,
  Network,
  Bell,
  FileText,
  LayoutDashboard,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable } from "@/common/Datatable";
import TableSearch from "@/common/TableSearch";
import Pagination from "@/common/Pagination";
import CustomPanel from "@/common/CustomPanel";
import { Field, TextField, SelectField } from "@/components/FormPrimitives";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { notify } from "@/lib/notify";

import { BarcodePreviewModal } from "@/components/BarcodePreviewModal";
import { PatientPrintPreviewModal } from "@/components/PatientPrintPreviewModal";

const HEADER_CONFIG: Record<string, { icon: any; subtitle: string }> = {
  "Registered Patients": { icon: UsersRound, subtitle: "View and manage registered patient records" },
  "OP Registration": { icon: UserPlus, subtitle: "Register and manage outpatient registrations" },
  "Revisit": { icon: CalendarClock, subtitle: "View and manage patient revisit records" },
  "Revisit Records": { icon: CalendarClock, subtitle: "View and manage patient revisit records" },
  "Diagnosis Entry": { icon: Stethoscope, subtitle: "Manage patient diagnosis information" },
  "Revisit Cancellation": { icon: Ban, subtitle: "Manage revisit cancellation records" },
  "Revisit Cancellation Records": { icon: Ban, subtitle: "Manage revisit cancellation records" },
  "Antenatal Registration": { icon: Baby, subtitle: "Manage antenatal registration records" },
  "Registered ANC Records": { icon: Baby, subtitle: "Manage antenatal registration records" },
  "Hospital Master": { icon: Building2, subtitle: "Manage hospital information" },
  "Hospital Master Records": { icon: Building2, subtitle: "Manage hospital information" },
  "Referral Master": { icon: Network, subtitle: "Manage referral information" },
  "Referral Master Records": { icon: Network, subtitle: "Manage referral information" },
  "Notifications": { icon: Bell, subtitle: "View and manage notifications" },
  "Documents": { icon: FileText, subtitle: "Manage hospital documents" },
  "Dashboard": { icon: LayoutDashboard, subtitle: "Hospital Management Dashboard" },
  "Settings": { icon: SettingsIcon, subtitle: "Configure application settings" },
};

export interface FilterOption {
  label: string;
  key: string;
  type?: "text" | "select";
  options?: string[];
}

interface StandardModuleTableProps<TData> {
  title: string;
  subtitle?: string;
  icon?: any;
  countUnit?: string;
  searchPlaceholder?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  searchField?: (item: TData) => string;
  isLoading?: boolean;
  filterFields?: FilterOption[];
  hideDateFilters?: boolean;
  onAdd?: () => void;
  headerExtra?: React.ReactNode;
}

export function StandardModuleTable<TData extends Record<string, any>>({
  title,
  subtitle,
  icon,
  countUnit = "Records",
  searchPlaceholder = "Search...",
  columns,
  data,
  searchField,
  isLoading = false,
  filterFields,
  hideDateFilters = false,
  onAdd,
  headerExtra,
}: StandardModuleTableProps<TData>) {
  const config = HEADER_CONFIG[title];
  const HeaderIcon = icon || config?.icon;
  const headerSubtitle = subtitle || config?.subtitle;

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showActions, setShowActions] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPrintItem, setSelectedPrintItem] = useState<TData | null>(null);
  const [selectedBarcodeItem, setSelectedBarcodeItem] = useState<TData | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // Active filters & temp filters
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [tempFilters, setTempFilters] = useState<Record<string, string>>({});

  const hasActiveFilters =
    Object.keys(filters).length > 0 || Boolean(fromDate) || Boolean(toDate) || Boolean(search.trim());

  // Automatically derive default filter fields if not provided
  const derivedFilterFields: FilterOption[] = useMemo(() => {
    if (filterFields && filterFields.length > 0) return filterFields;
    if (!data || data.length === 0) return [];

    const sample = data[0];
    const keysToExclude = ["id", "uhidNo", "opNo", "ancNo", "contactNo", "phone", "email"];

    return Object.keys(sample)
      .filter((k) => typeof sample[k] === "string" && !keysToExclude.includes(k))
      .slice(0, 4)
      .map((k) => {
        const uniqueValues = Array.from(new Set(data.map((d) => String(d[k] || "")).filter(Boolean)));
        const isSelect = uniqueValues.length > 0 && uniqueValues.length <= 15;
        const formattedLabel = k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        return {
          label: formattedLabel,
          key: k,
          type: isSelect ? "select" : "text",
          options: isSelect ? uniqueValues : undefined,
        };
      });
  }, [filterFields, data]);

  // Close actions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Combined Filtering Logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global Search Filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((item) => {
        if (searchField) {
          return searchField(item).toLowerCase().includes(q);
        }
        return Object.values(item).some((val) =>
          String(val ?? "").toLowerCase().includes(q)
        );
      });
    }

    // Dynamic Field Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => {
          // Special handling for status field
          if (key === "status") {
            const valLower = value.toLowerCase();
            if (valLower === "all") return true;
            const itemStatus = (item.status || "active").toLowerCase();
            return itemStatus === valLower;
          }
          
          const itemVal = item[key];
          if (itemVal === undefined || itemVal === null) return false;
          
          // Check if this field is a select field
          const isSelectField = derivedFilterFields.some(
            field => field.key === key && field.type === "select"
          );
          
          // For select fields, do exact match (case-insensitive)
          if (isSelectField) {
            return String(itemVal).toLowerCase() === String(value).toLowerCase();
          }
          
          // For text fields, do partial match (case-insensitive)
          return String(itemVal).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // From Date -> To Date Filtering
    if (fromDate || toDate) {
      result = result.filter((item) => {
        const dateStr = item.registrationDate || item.ancDate || item.cancelledDate || item.date || item.createdDate || item.orderDate || item.billDate || item.admissionDate;
        if (!dateStr) return true;
        const itemDate = new Date(dateStr);
        if (isNaN(itemDate.getTime())) return true;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    return result;
  }, [data, search, filters, fromDate, toDate, searchField, derivedFilterFields]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, fromDate, toDate]);

  // Open Filter Panel
  const handleOpenFilterPanel = () => {
    setTempFilters({ ...filters });
    setIsFilterPanelOpen(true);
    setShowActions(false);
  };

  // Apply Filter
  const handleApplyFilter = () => {
    setFilters({ ...tempFilters });
    setIsFilterPanelOpen(false);
  };

  // Reset / Clear All Filters
  const handleResetFilters = () => {
    setSearch("");
    setFilters({});
    setTempFilters({});
    setFromDate(undefined);
    setToDate(undefined);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  // Table object matching DataTable expectations
  const tableObject = {
    setPageSize: (size: number) => handleItemsPerPageChange(size),
    setPageIndex: (index: number) => setCurrentPage(index + 1),
    previousPage: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
    nextPage: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
    getCanPreviousPage: () => currentPage > 1,
    getCanNextPage: () => currentPage < totalPages,
    getState: () => ({ pagination: { pageIndex: currentPage - 1, pageSize: itemsPerPage } }),
  };

  const handleExportExcel = () => {
    if (!paginatedData.length) {
      notify.validationError("No data to export on current page");
      return;
    }
    try {
      const headers = Object.keys(paginatedData[0] || {});
      const csvContent = [
        headers.join(","),
        ...paginatedData.map((row) =>
          headers
            .map((key) => {
              const val = row[key];
              if (
                typeof val === "string" &&
                (val.includes(",") || val.includes('"') || val.includes("\n"))
              ) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title.trim()}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`Exported ${paginatedData.length} records to ${title.trim()}.xlsx`);
    } catch (err) {
      console.error(err);
      notify.serverError("Failed to export data");
    } finally {
      setShowActions(false);
    }
  };

  const handlePrint = () => {
    setShowActions(false);
    const originalTitle = document.title;
    document.title = title;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="bg-card border border-border rounded-md p-6">
      {/* Title & Top Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Icon + Title & Subtitle + Count Badge */}
        <div className="flex items-center gap-3">
          {HeaderIcon && (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0"
              style={{
                background: "var(--side-menu)",
                color: "var(--blue-text-color)",
              }}
            >
              <HeaderIcon className="h-5 w-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold text-foreground">{title}</h1>
              {countUnit && (
                <Badge variant="secondary" className="text-xs">
                  {filteredData.length} {countUnit}
                </Badge>
              )}
            </div>
            {headerSubtitle && (
              <p className="text-[12.5px] text-muted-foreground">{headerSubtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Search + Date Pickers + Actions + Add */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="flex-1 sm:flex-none">
            <TableSearch
              placeholder={searchPlaceholder}
              value={search}
              onChange={(val: string) => setSearch(val)}
            />
          </div>

          {/* Date Pickers */}
          {!hideDateFilters && (
            <div className="flex items-center gap-2 shrink-0">
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal cursor-pointer",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd MMM yyyy") : <span>From Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date: any) => setFromDate(date)}
                  />
                </PopoverContent>
              </Popover>

              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal cursor-pointer",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd MMM yyyy") : <span>To Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date: any) => setToDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Extra Header Controls */}
          {headerExtra}

          {/* Action Menu */}
          <div className="relative" ref={actionRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className={cn("shrink-0 cursor-pointer", hasActiveFilters && "border-blue-500 text-blue-600 bg-blue-50/50")}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                title="Clear all filters"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shadow-md hover:bg-blue-700 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}

            {showActions && (
              <div className="absolute right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-2 flex items-center gap-1 z-50">
                <button
                  onClick={handleOpenFilterPanel}
                  className="p-2 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition cursor-pointer"
                  title="Open Filter Panel"
                >
                  <Filter size={18} />
                </button>
                <button
                  onClick={handleExportExcel}
                  className="p-2 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition cursor-pointer"
                  title="Export to CSV"
                >
                  <FileSpreadsheet size={18} />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition cursor-pointer"
                  title="Print Table"
                >
                  <Printer size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Add Button */}
          {onAdd && (
            <Button
              size="sm"
              onClick={onAdd}
              className="h-9 w-9 p-0 shrink-0 text-white cursor-pointer"
              style={{ background: "var(--blue-btn)" }}
              title="Add New"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Indicators & Loader Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-3">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto cursor-pointer"
            >
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={paginatedData} />

      {/* Pagination Footer */}
      <div className="mt-4 border-t border-border pt-4">
        <Pagination
          table={tableObject}
          totalCount={filteredData.length}
        />
      </div>

      {/* Dynamic Filter Panel Drawer - UPDATED: Removed "All" option */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title="Filter Records"
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={handleApplyFilter}
        saveLabel="Apply Filter"
        width="450px"
      >
        <div className="space-y-4">
          {derivedFilterFields.map((field) => (
            <Field key={field.key} label={field.label}>
              {field.type === "select" && field.options ? (
                <SelectField
                  options={field.options} // Removed "All" from here
                  value={tempFilters[field.key] || ""}
                  onChange={(val) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      [field.key]: val,
                    }))
                  }
                />
              ) : (
                <TextField
                  placeholder={`Filter by ${field.label}...`}
                  value={tempFilters[field.key] || ""}
                  onChange={(val) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      [field.key]: val,
                    }))
                  }
                />
              )}
            </Field>
          ))}
        </div>
      </CustomPanel>

      {/* Print Preview Modal */}
      {selectedPrintItem && (
        <PatientPrintPreviewModal
          patient={selectedPrintItem as any}
          isOpen={Boolean(selectedPrintItem)}
          onClose={() => setSelectedPrintItem(null)}
        />
      )}

      {/* Barcode Preview Modal */}
      {selectedBarcodeItem && (
        <BarcodePreviewModal
          patient={selectedBarcodeItem as any}
          isOpen={Boolean(selectedBarcodeItem)}
          onClose={() => setSelectedBarcodeItem(null)}
        />
      )}
    </div>
  );
}