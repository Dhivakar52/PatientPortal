import React, { useState, useMemo } from 'react'
import { CalendarX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Pagination from '@/common/Pagination'
import { VisitCard } from '../Visits/VisitCard'
import { type Appointment, type Patient } from '@/types/patient.types'
import {
  useSearchAndFilter,
  SearchAndFilterControls,
  FilterSummary,
  FilterDrawer,
  parseStandardDate,
} from '@/common/SearchAndFilter'

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
  currentPatient?: Patient | null
  onView?: (appt: Appointment) => void
  onViewReceipt?: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
  onEditAppointment?: (appt: Appointment) => void
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  currentPatient,
  onView,
  onViewReceipt,
  onCancelAppointment,
  onEditAppointment,
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  // Reusable Search & Filter Hook
  const {
    searchTerm,
    setSearchTerm,
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
    handleOpenFilterPanel,
    handleApplyFilter,
    clearFilters,
  } = useSearchAndFilter({
    onFilterChange: () => setPageIndex(0),
  })

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        // Date filter
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
        const timeDiff = dateA - dateB
        if (timeDiff !== 0) return timeDiff

        const slotA = a.slot || a.TimeSlot || a.Timeslot || ''
        const slotB = b.slot || b.TimeSlot || b.Timeslot || ''
        return slotA.localeCompare(slotB)
      })
  }, [appointments, searchTerm, fromDate, toDate])

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

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Upcoming Appointments
          </h3>
          <Badge variant="secondary" className="text-xs font-semibold">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'Appointment' : 'Appointments'}
          </Badge>
        </div>

        {/* Reusable Search & Filter Controls */}
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
          searchPlaceholder="Search doctor, dept, ID..."
          searchTitle="Search upcoming appointments"
          filterTitle="Filter by date range"
        />
      </div>

      {/* Filtered Sub-counter */}
      <FilterSummary
        isFiltered={isFiltered}
        filteredCount={filteredAppointments.length}
        totalCount={appointments.length}
        unitName="appointment"
        onClearFilters={clearFilters}
      />

      {/* Appointments List (Max 5 per page) */}
      {paginatedData.length > 0 ? (
        <div className="space-y-3">
          {paginatedData.map((appt) => (
            <VisitCard
              key={appt.apptNo || appt.AppointmentNo || appt.AppointmentID}
              appointment={appt}
              currentPatient={currentPatient}
              onView={onView}
              onDownloadReceipt={onViewReceipt}
              onCancelAppointment={onCancelAppointment}
              onEditAppointment={onEditAppointment}
              showDownload={false}
              showCancel={true}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded p-8 text-center text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-1">
            <CalendarX className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {isFiltered ? 'No upcoming appointments match your filter criteria.' : 'No Upcoming Appointments Found!'}
          </p>
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-2 text-xs font-semibold cursor-pointer"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination Controls (5 per page) */}
      {filteredAppointments.length > 0 && (
        <Pagination table={tableObject as any} totalCount={filteredAppointments.length} pageSizeOptions={[5, 10, 25]} />
      )}

      {/* Reusable Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterPanelOpen}
        title="Filter Upcoming Appointments"
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleApplyFilter}
        saveLabel="Apply Filter"
        width="420px"
        showDateRange={true}
        tempFromDate={tempFromDate}
        setTempFromDate={setTempFromDate}
        tempToDate={tempToDate}
        setTempToDate={setTempToDate}
        showStatusFilter={false}
      />
    </div>
  )
}
