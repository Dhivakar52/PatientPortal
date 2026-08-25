import React, { useState, useMemo } from 'react'
import { Search, Filter, CalendarX, RotateCcw, X, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NativeSelect } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { DateField } from '@/components/FormPrimitives'
import Pagination from '@/common/Pagination'
import Status from '@/common/Status'
import CustomPanel from '@/common/CustomPanel'
import { VisitCard } from './VisitCard'
import { type Appointment, type Patient } from '@/types/patient.types'
import { HOSPITAL_NAME } from '@/constants/patient.constants'
import { todayStr } from '@/utils/patient.utils'

interface VisitsTableProps {
  appointments: Appointment[]
  onViewReceipt: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
  currentPatient?: Patient | null
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

// Helper to parse date string into a Date object for range comparisons and sorting
const parseStandardDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  // DD-MM-YYYY or DD/MM/YYYY
  const ddMmMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (ddMmMatch) {
    const day = parseInt(ddMmMatch[1], 10)
    const month = parseInt(ddMmMatch[2], 10)
    const year = parseInt(ddMmMatch[3], 10)
    return new Date(year, month - 1, day)
  }
  // DD-MMM-YYYY
  const ddMmmMatch = dateStr.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{4})$/)
  if (ddMmmMatch) {
    const day = parseInt(ddMmmMatch[1], 10)
    const monthStr = ddMmmMatch[2].toUpperCase()
    const year = parseInt(ddMmmMatch[3], 10)
    const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(monthStr)
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day)
    }
  }
  // YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10)
    const month = parseInt(isoMatch[2], 10)
    const day = parseInt(isoMatch[3], 10)
    return new Date(year, month - 1, day)
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

export const VisitsTable: React.FC<VisitsTableProps> = ({
  appointments,
  onViewReceipt,
  onCancelAppointment,
  currentPatient,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(6)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Date Filter States
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  // Filter CustomPanel UI States
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>()
  const [tempToDate, setTempToDate] = useState<Date | undefined>()
  const [tempStatusFilter, setTempStatusFilter] = useState<string>('all')

  // Search Toggle State
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const today = todayStr()

  // Open Filter Panel with Current Applied Values
  const handleOpenFilterPanel = () => {
    setTempFromDate(fromDate)
    setTempToDate(toDate)
    setTempStatusFilter(statusFilter)
    setIsFilterPanelOpen(true)
  }

  // Apply Filter Values from CustomPanel
  const handleApplyFilter = () => {
    setFromDate(tempFromDate)
    setToDate(tempToDate)
    setStatusFilter(tempStatusFilter)
    setPageIndex(0)
    setIsFilterPanelOpen(false)
  }

  // Reset / Clear All Filters
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setFromDate(undefined)
    setToDate(undefined)
    setTempFromDate(undefined)
    setTempToDate(undefined)
    setTempStatusFilter('all')
    setSortOrder('newest')
    setPageIndex(0)
    setIsFilterPanelOpen(false)
  }

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
          (appt.date < today ? 'Visited' : 'Scheduled')
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

  const isFiltered = searchTerm !== '' || statusFilter !== 'all' || fromDate !== undefined || toDate !== undefined

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
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        {/* Left Side: Title, Total Visits Badge, Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Visits History
          </h3>

          <Badge variant="secondary" className="text-xs font-semibold">
            {filteredAppointments.length} Visits
          </Badge>
        </div>

        {/* Right Side: Search Icon & Filter Icon */}
        <div className="flex items-center gap-2 relative">
          {/* Search Toggle / Input */}
          {isSearchOpen || searchTerm !== '' ? (
            <div className="relative flex items-center min-w-[200px] sm:min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search by doctor, dept, ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPageIndex(0)
                }}
                className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setIsSearchOpen(false)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5  border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Search visits"
              style={{ borderRadius: '4px' }}
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Filter Custom Panel Button */}
          <button
            type="button"
            onClick={handleOpenFilterPanel}
            className={`p-1.5  border transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-2xs ${isFilterPanelOpen || isFiltered
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            style={{ borderRadius: '4px' }}
            title="Filter visits"
          >
            <Filter className="w-4 h-4" />
            {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
        </div>
      </div>

      {/* Results Sub-counter when filtered */}
      {isFiltered && (
        <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredAppointments.length}</span> {filteredAppointments.length === 1 ? 'visit' : 'visits'} (filtered from {appointments.length} total)
        </div>
      )}

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

      {/* FILTER CUSTOM PANEL DRAWER */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title="Filter Visits"
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={handleApplyFilter}
        saveLabel="Apply Filter"
        width="420px"
      >
        <div className="space-y-5">
          {/* 1. Date Filter (From Date & To Date) with custom Popover Calendar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  From Date
                </label>
                <DateField
                  value={tempFromDate}
                  onChange={setTempFromDate}
                  placeholder="Select From Date"
                  defaultLabel="Select From Date"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  To Date
                </label>
                <DateField
                  value={tempToDate}
                  onChange={setTempToDate}
                  placeholder="Select To Date"
                  defaultLabel="Select To Date"
                />
              </div>
            </div>
          </div>

          {/* 2. Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Status
            </label>
            <NativeSelect
              value={tempStatusFilter}
              onChange={(e) => setTempStatusFilter(e.target.value)}
              size="sm"
              className="w-full text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="visited">Visited</option>
              <option value="not visited">Not Visited</option>
              <option value="cancelled">Cancelled</option>
            </NativeSelect>
          </div>

          {/* Reset Action inside Panel */}
          {(tempFromDate !== undefined || tempToDate !== undefined || tempStatusFilter !== 'all') && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setTempFromDate(undefined)
                  setTempToDate(undefined)
                  setTempStatusFilter('all')
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Reset Filter Selections
              </button>
            </div>
          )}
        </div>
      </CustomPanel>

      {/* VIEW DETAILS PANEL MODAL */}
      <CustomPanel
        isOpen={isViewPanelOpen}
        title="Appointment Details"
        onClose={handleClosePanel}
        onSave={handleClosePanel}
        saveLabel="Close"
        width="500px"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            {/* Appointment Info Header */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Appointment No</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  #{selectedAppointment.apptNo}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</span>
                <Status status={selectedAppointment.date < todayStr() ? 'completed' : 'scheduled'} showLabel />
              </div>
            </div>

            {/* Patient Details if available */}
            {currentPatient && (
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Patient Profile
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {currentPatient.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Mobile</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                      +91 {currentPatient.mobile}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Details Grid */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Visit Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Date</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Time Slot</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.slot}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Doctor</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.doctor}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Department</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.department}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Unit / Room</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.unit} {selectedAppointment.room ? `(${selectedAppointment.room})` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Hospital</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {HOSPITAL_NAME}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewReceipt(selectedAppointment)}
                className="flex-1 text-xs cursor-pointer border-slate-300 dark:border-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Download Receipt
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewReceipt(selectedAppointment)}
                className="flex-1 text-xs cursor-pointer border-slate-300 dark:border-slate-700"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                View Receipt
              </Button>
            </div>
          </div>
        )}
      </CustomPanel>
    </div>
  )
}

export default VisitsTable