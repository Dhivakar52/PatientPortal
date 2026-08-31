import React, { useState, useMemo } from 'react'
import { Search, Filter, CalendarX, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DateField } from '@/components/FormPrimitives'
import Pagination from '@/common/Pagination'
import CustomPanel from '@/common/CustomPanel'
import { VisitCard } from '../Visits/VisitCard'
import { type Appointment, type Patient } from '@/types/patient.types'

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
  currentPatient?: Patient | null
  onView?: (appt: Appointment) => void
  onViewReceipt?: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
  onEditAppointment?: (appt: Appointment) => void
}

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
  const [searchTerm, setSearchTerm] = useState('')
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  // Filter Drawer UI States
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>()
  const [tempToDate, setTempToDate] = useState<Date | undefined>()

  // Search Toggle State
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleOpenFilterPanel = () => {
    setTempFromDate(fromDate)
    setTempToDate(toDate)
    setIsFilterPanelOpen(true)
  }

  const handleApplyFilter = () => {
    setFromDate(tempFromDate)
    setToDate(tempToDate)
    setPageIndex(0)
    setIsFilterPanelOpen(false)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFromDate(undefined)
    setToDate(undefined)
    setTempFromDate(undefined)
    setTempToDate(undefined)
    setPageIndex(0)
    setIsFilterPanelOpen(false)
  }

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

  const isFiltered = searchTerm !== '' || fromDate !== undefined || toDate !== undefined

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Upcoming Appointment
          </h3>
          <Badge variant="secondary" className="text-xs font-semibold">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'Appointment' : 'Appointments'}
          </Badge>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
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
              style={{ borderRadius: '4px' }}
              title="Search upcoming appointments"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Filter Button */}
          <button
            type="button"
            onClick={handleOpenFilterPanel}
            className={`p-1.5 border transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-2xs ${
              isFilterPanelOpen || isFiltered
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            style={{ borderRadius: '4px' }}
            title="Filter by date range"
          >
            <Filter className="w-4 h-4" />
            {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
        </div>
      </div>

      {/* Filtered Sub-counter */}
      {isFiltered && (
        <div className="text-xs text-slate-500 dark:text-slate-400 px-1 flex items-center justify-between">
          <span>
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredAppointments.length}</span> (filtered from {appointments.length} total)
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

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

      {/* Filter CustomPanel Drawer */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title="Filter Upcoming Appointments"
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={handleApplyFilter}
        saveLabel="Apply Filter"
        width="420px"
      >
        <div className="space-y-5">
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

          {(tempFromDate !== undefined || tempToDate !== undefined) && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setTempFromDate(undefined)
                  setTempToDate(undefined)
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Reset Date Filter
              </button>
            </div>
          )}
        </div>
      </CustomPanel>
    </div>
  )
}
