import React, { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/common/Datatable'
import Pagination from '@/common/Pagination'
import Status from '@/common/Status'
import { ActionMenu } from '@/common/ActionMenu'
import CustomPanel from '@/common/CustomPanel'
import { type Appointment } from '@/types/patient.types'
import { HOSPITAL_NAME } from '@/constants/patient.constants'
import { formatDateBadge, todayStr } from '@/utils/patient.utils'

interface VisitsTableProps {
  appointments: Appointment[]
  onViewReceipt: (appt: Appointment) => void
}

export const VisitsTable: React.FC<VisitsTableProps> = ({ appointments, onViewReceipt }) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const today = todayStr()

  // State for View Panel
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

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const b = formatDateBadge(row.original.date)
        return (
          <div> {b.d} - {b.m} -  {b.y} </div>

        )
      },
    },
    {
      accessorKey: 'doctor',
      header: 'Doctor & Department',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.doctor}</div>
          <div className="text-xs text-slate-500">
            {row.original.department} • {HOSPITAL_NAME}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'slot',
      header: 'Time Slot',
      cell: ({ row }) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {row.original.slot} ({row.original.unit})
        </div>
      ),
    },
    {
      accessorKey: 'apptNo',
      header: 'Appointment No',
      cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.apptNo}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isPast = row.original.date < today
        return <Status status={isPast ? 'completed' : 'scheduled'} showLabel />
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={handleView}
        // onPrint={() => onViewReceipt(row.original)}
        // onBarcode={() => onViewReceipt(row.original)}
        />
      ),
    },
  ]

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
        Math.min(Math.ceil(appointments.length / pageSize) - 1, prev + 1)
      ),
    getCanPreviousPage: () => pageIndex > 0,
    getCanNextPage: () => (pageIndex + 1) * pageSize < appointments.length,
  }

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize
    return appointments.slice(start, start + pageSize)
  }, [appointments, pageIndex, pageSize])

  return (
    <>
      <DataTable columns={columns} data={paginatedData} />
      <Pagination table={tableObject as any} totalCount={appointments.length} />

      {/* View Details Panel */}
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
            {/* Appointment Info */}
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

            {/* Patient Details */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              {/* <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Patient Details
              </h4> */}
              {/* <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Name</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.patientName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Contact</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.contact || 'N/A'}
                  </p>
                </div>
              </div> */}
            </div>

            {/* Appointment Details */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Appointment Details
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
                  <p className="text-xs text-slate-400 dark:text-slate-500">Unit</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedAppointment.unit}
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
                className="flex-1 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download Receipt
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewReceipt(selectedAppointment)}
                className="flex-1 text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                View Receipt
              </Button>
            </div>
          </div>
        )}
      </CustomPanel>
    </>
  )
}