import React, { useState, useMemo } from 'react'
import { Search, Filter, CalendarX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NativeSelect } from '@/components/ui/native-select'
import { DateField } from '@/components/FormPrimitives'
import Pagination from '@/common/Pagination'
import CustomPanel from '@/common/CustomPanel'
import { VisitCard } from '../Visits/VisitCard'
import { type Appointment, type Patient } from '@/types/patient.types'

interface PastVisitsProps {
  appointments: Appointment[]
  onView?: (appt: Appointment) => void
  onViewReceipt: (appt: Appointment) => void
  currentPatient?: Patient | null
}

// Helper to parse date string into a Date object for range comparisons and sorting
const parseStandardDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  const ddMmMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (ddMmMatch) {
    const day = parseInt(ddMmMatch[1], 10)
    const month = parseInt(ddMmMatch[2], 10)
    const year = parseInt(ddMmMatch[3], 10)
    return new Date(year, month - 1, day)
  }
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

export const PastVisits: React.FC<PastVisitsProps> = ({
  appointments,
  onView,
  onViewReceipt,
  currentPatient,
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(5)
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

  // Filter & Search Logic
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        const rawStatus = String(
          appt.AppointmentStatus ||
          appt.status ||
          appt.Status ||
          (appt as unknown as Record<string, unknown>).appointmentStatus ||
          ''
        ).toLowerCase()

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
  }, [appointments, searchTerm, statusFilter, fromDate, toDate, sortOrder])

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
    if (appointments.length <= 5) {
      return appointments
    }
    const start = pageIndex * pageSize
    return filteredAppointments.slice(start, start + pageSize)
  }, [appointments, filteredAppointments, pageIndex, pageSize])

  const isFiltered = searchTerm !== '' || statusFilter !== 'all' || fromDate !== undefined || toDate !== undefined
  const showControls = appointments.length > 5

  if (appointments.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Past Visits</h3>
        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded p-6 text-center text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
          No past visits yet.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Title & Count Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Past Visits
          </h3>

          <Badge variant="secondary" className="text-xs font-semibold">
            {filteredAppointments.length} Visits
          </Badge>
        </div>

        {/* Right Side: Search & Filter Controls (When > 5 items or when filtered) */}
        {showControls && (
          <div className="flex items-center gap-2 relative">
            {/* Search Toggle / Input */}
            {isSearchOpen || searchTerm !== '' ? (
              <div className="relative flex items-center min-w-[200px] sm:min-w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search doctor, dept, ID..."
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
                className="p-1.5 border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
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
              className={`p-1.5 border transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-2xs ${
                isFilterPanelOpen || isFiltered
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
        )}
      </div>

      {/* Results Sub-counter when filtered */}
      {showControls && isFiltered && (
        <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredAppointments.length}</span> {filteredAppointments.length === 1 ? 'visit' : 'visits'} (filtered from {appointments.length} total)
        </div>
      )}

      {/* CARD LIST PRESENTATION */}
      {paginatedData.length > 0 ? (
        <div className="space-y-3">
          {paginatedData.map((appt) => (
            <VisitCard
              key={appt.apptNo || appt.AppointmentNo}
              appointment={appt}
              currentPatient={currentPatient}
              onView={onView}
              onDownloadReceipt={onViewReceipt}
              showDownload={true}
              showCancel={false}
            />
          ))}
        </div>
      ) : (
        /* EMPTY STATE UI WHEN FILTERED */
        <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-1">
            <CalendarX className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Visits Match Criteria</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No past visits match your selected search or date range filter.
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

      {/* PAGINATION (When > 5 items) */}
      {showControls && filteredAppointments.length > 0 && (
        <Pagination table={tableObject} totalCount={filteredAppointments.length} />
      )}

      {/* Filter Side Drawer Panel */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title="Filter Past Visits"
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={handleApplyFilter}
        saveLabel="Apply Filter"
        cancelLabel="Reset"
        onCancel={clearFilters}
        width="400px"
      >
        <div className="space-y-5">
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Visit Status
            </label>
            <NativeSelect
              value={tempStatusFilter}
              onChange={(e) => setTempStatusFilter(e.target.value)}
              className="w-full text-xs h-9"
            >
              <option value="all">All Statuses</option>
              <option value="visited">Visited / Completed</option>
              <option value="not visited">Not Visited</option>
              <option value="cancelled">Cancelled</option>
            </NativeSelect>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Visit Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">From Date</span>
                <DateField
                  value={tempFromDate}
                  onChange={(date) => setTempFromDate(date)}
                  placeholder="Select From Date"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">To Date</span>
                <DateField
                  value={tempToDate}
                  onChange={(date) => setTempToDate(date)}
                  placeholder="Select To Date"
                />
              </div>
            </div>
          </div>
        </div>
      </CustomPanel>
    </div>
  )
}

export default PastVisits
