import React, { useState, useMemo } from 'react'
import { CalendarX, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Pagination from '@/common/Pagination'
import { AppointmentDetailsPanel } from '@/common/AppointmentDetailsPanel'
import { VisitCard } from './VisitCard'
import { type Appointment, type Patient } from '@/types/patient.types'
import { todayStr } from '@/utils/patient.utils'
import {
  useSearchAndFilter,
  SearchAndFilterControls,
  FilterSummary,
  FilterDrawer,
  parseStandardDate,
} from '@/common/SearchAndFilter'

interface VisitsTableProps {
  appointments: Appointment[]
  onViewReceipt: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
  onEditAppointment?: (appt: Appointment) => void
  currentPatient?: Patient | null
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export const VisitsTable: React.FC<VisitsTableProps> = ({
  appointments,
  onViewReceipt,
  onCancelAppointment,
  onEditAppointment,
  currentPatient,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(6)
  const [sortOrder] = useState<'newest' | 'oldest'>('newest')

  const today = todayStr()

  // Reusable Search & Filter Hook
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    fromDate,
    toDate,
    isFiltered,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    isSearchOpen,
    setIsSearchOpen,
    tempFromDate,
    setTempFromDate,
    tempToDate,
    setTempToDate,
    tempStatusFilter,
    setTempStatusFilter,
    handleOpenFilterPanel,
    handleApplyFilter,
    clearFilters,
  } = useSearchAndFilter({
    onFilterChange: () => setPageIndex(0),
  })

  // State for View Details Panel Modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewPanelOpen, setIsViewPanelOpen] = useState(false)

  const handleView = (appt: Appointment) => {
    setSelectedAppointment(appt)
    setIsViewPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsViewPanelOpen(false)
    setSelectedAppointment(null)
  }

  // Filter & Search Logic
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        const rawStatus = (
          appt.AppointmentStatus ||
          appt.status ||
          appt.Status ||
          (appt as any).appointmentStatus ||
          (appt.date < today ? 'Visited' : '')
        ).toLowerCase()

        // Visits tab strictly displays only: Visited, Not Visited, and Cancelled
        const isAllowedVisitStatus =
          rawStatus === 'visited' ||
          rawStatus === 'completed' ||
          rawStatus === 'not visited' ||
          rawStatus === 'cancelled'

        if (!isAllowedVisitStatus) {
          return false
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'visited') {
            if (rawStatus !== 'visited' && rawStatus !== 'completed') return false
          } else if (rawStatus !== statusFilter.toLowerCase()) {
            return false
          }
        }

        // Date filter logic
        const apptDateObj = parseStandardDate(appt.date || appt.AppointmentDate || '')
        if (apptDateObj) {
          if (fromDate) {
            const fromObj = new Date(fromDate)
            fromObj.setHours(0, 0, 0, 0)
            if (apptDateObj < fromObj) return false
          }
          if (toDate) {
            const toObj = new Date(toDate)
            toObj.setHours(23, 59, 59, 999)
            if (apptDateObj > toObj) return false
          }
        }

        // Search term filter
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase().trim()
          const matchDoctor = (appt.doctor || appt.DoctorName || '').toLowerCase().includes(q)
          const matchDept = (appt.department || appt.DeptName || '').toLowerCase().includes(q)
          const matchApptNo = (appt.apptNo || appt.AppointmentNo || '').toLowerCase().includes(q)
          const matchUnit = (appt.unit || appt.Unit || '').toLowerCase().includes(q)
          return matchDoctor || matchDept || matchApptNo || matchUnit
        }

        return true
      })
      .sort((a, b) => {
        const dateA = parseStandardDate(a.date || a.AppointmentDate || '')?.getTime() || 0
        const dateB = parseStandardDate(b.date || b.AppointmentDate || '')?.getTime() || 0
        if (sortOrder === 'newest') {
          return dateB - dateA
        }
        return dateA - dateB
      })
  }, [appointments, searchTerm, statusFilter, fromDate, toDate, sortOrder, today])

  // Pagination Table Object
  const tableObject = {
    getState: () => ({ pagination: { pageIndex, pageSize } }),
    setPageIndex: (index: number) => setPageIndex(index),
    setPageSize: (size: number) => {
      setPageSize(size)
      setPageIndex(0)
    },
    previousPage: () => setPageIndex((prev) => Math.max(0, prev - 1)),
    nextPage: () =>
      setPageIndex((prev) =>
        Math.min(Math.ceil(filteredAppointments.length / pageSize) - 1, prev + 1)
      ),
    getCanPreviousPage: () => pageIndex > 0,
    getCanNextPage: () => (pageIndex + 1) * pageSize < filteredAppointments.length,
  }

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize
    return filteredAppointments.slice(start, start + pageSize)
  }, [filteredAppointments, pageIndex, pageSize])

  // ERROR STATE
  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-3">
        <div className="text-rose-600 dark:text-rose-400 font-bold text-base">Unable to Load Visits</div>
        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        {onRetry && (
          <Button
            size="sm"
            onClick={onRetry}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        {/* Left Side: Title & Total Visits Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Visits History
          </h3>

          <Badge variant="secondary" className="text-xs font-semibold">
            {filteredAppointments.length} Visits
          </Badge>
        </div>

        {/* Right Side: Reusable Search & Filter Controls */}
        <SearchAndFilterControls
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v)
            setPageIndex(0)
          }}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          onOpenFilterPanel={handleOpenFilterPanel}
          isFiltered={isFiltered}
          isFilterPanelOpen={isFilterPanelOpen}
          searchPlaceholder="Search by doctor, dept, ID..."
          searchTitle="Search visits"
          filterTitle="Filter visits"
        />
      </div>

      {/* Results Sub-counter when filtered */}
      <FilterSummary
        isFiltered={isFiltered}
        filteredCount={filteredAppointments.length}
        totalCount={appointments.length}
        unitName="visit"
        onClearFilters={clearFilters}
      />

      {/* LOADING SKELETON STATE */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex items-center gap-4"
            >
              <Skeleton className="h-14 w-16 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedData.length > 0 ? (
        /* CARD LIST PRESENTATION */
        <div className="space-y-2.5">
          {paginatedData.map((appt) => (
            <VisitCard
              key={appt.apptNo}
              appointment={appt}
              currentPatient={currentPatient}
              onView={handleView}
              onDownloadReceipt={onViewReceipt}
              onCancelAppointment={onCancelAppointment}
              onEditAppointment={onEditAppointment}
              showDownload={true}
              showCancel={true}
            />
          ))}
        </div>
      ) : (
        /* EMPTY STATE UI */
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-1">
            <CalendarX className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Visits Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {isFiltered
              ? 'No visit history records match your selected date range or status filter criteria.'
              : 'There are currently no hospital visit records available for this patient profile.'}
          </p>
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-2 text-xs font-semibold cursor-pointer border-slate-300 dark:border-slate-700"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* PAGINATION */}
      {!isLoading && filteredAppointments.length > 0 && (
        <Pagination table={tableObject as any} totalCount={filteredAppointments.length} />
      )}

      {/* REUSABLE FILTER CUSTOM PANEL DRAWER */}
      <FilterDrawer
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleApplyFilter}
        title="Filter Visits"
        saveLabel="Apply Filter"
        width="420px"
        showDateRange={true}
        tempFromDate={tempFromDate}
        setTempFromDate={setTempFromDate}
        tempToDate={tempToDate}
        setTempToDate={setTempToDate}
        showStatusFilter={true}
        statusLabel="Status"
        tempStatusFilter={tempStatusFilter}
        setTempStatusFilter={setTempStatusFilter}
        statusOptions={[
          { value: 'all', label: 'All Statuses' },
          { value: 'visited', label: 'Visited' },
          { value: 'not visited', label: 'Not Visited' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />

      {/* VIEW DETAILS PANEL MODAL */}
      <AppointmentDetailsPanel
        isOpen={isViewPanelOpen}
        onClose={handleClosePanel}
        appointment={selectedAppointment}
        currentPatient={currentPatient}
        onViewReceipt={onViewReceipt}
      />
    </div>
  )
}

export default VisitsTable