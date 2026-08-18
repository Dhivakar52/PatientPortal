import React, { useState, useMemo } from 'react'
import { Search, Filter, CalendarX, Download, Eye, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
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
  currentPatient?: Patient | null
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export const VisitsTable: React.FC<VisitsTableProps> = ({
  appointments,
  onViewReceipt,
  currentPatient,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(6)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const today = todayStr()

  // State for View Panel Modal
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
        // Status filter
        const isPast = appt.date < today
        const status = isPast ? 'completed' : 'scheduled'
        if (statusFilter !== 'all' && status !== statusFilter) {
          return false
        }

        // Search term filter
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase().trim()
          const matchDoctor = appt.doctor.toLowerCase().includes(q)
          const matchDept = appt.department.toLowerCase().includes(q)
          const matchApptNo = appt.apptNo.toLowerCase().includes(q)
          const matchUnit = appt.unit.toLowerCase().includes(q)
          return matchDoctor || matchDept || matchApptNo || matchUnit
        }

        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.date.localeCompare(a.date)
        }
        return a.date.localeCompare(b.date)
      })
  }, [appointments, searchTerm, statusFilter, sortOrder, today])

  // Pagination Table Object Compatible with Pagination Component
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

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSortOrder('newest')
    setPageIndex(0)
  }

  const isFiltered = searchTerm !== '' || statusFilter !== 'all'

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
    <div className="space-y-5">
      {/* Controls Bar: Search + Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            type="text"
            placeholder="Search by doctor, department, or Appt ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPageIndex(0)
            }}
            className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 hidden md:inline" />
            <NativeSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'scheduled' | 'completed')
                setPageIndex(0)
              }}
              size="sm"
              className="w-36 h-9 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </NativeSelect>
          </div>

          {/* Sort Order */}
          <NativeSelect
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            size="sm"
            className="w-32 h-9 text-xs"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </NativeSelect>

          {/* Clear Filters Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredAppointments.length}</span> {filteredAppointments.length === 1 ? 'visit' : 'visits'}
          {isFiltered && <span className="ml-1 text-slate-400 dark:text-slate-500">(filtered from {appointments.length} total)</span>}
        </div>
      </div>

      {/* LOADING SKELETON STATE */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-8 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : paginatedData.length > 0 ? (
        /* CARD GRID PRESENTATION */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((appt) => (
            <VisitCard
              key={appt.apptNo}
              appointment={appt}
              currentPatient={currentPatient}
              onView={handleView}
              onDownloadReceipt={onViewReceipt}
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
              ? 'No visit history records match your selected search or status filter criteria.'
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