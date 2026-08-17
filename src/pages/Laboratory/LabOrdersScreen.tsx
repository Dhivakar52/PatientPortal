import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { LabOrder } from '@/types/lab.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { StandardModuleTable } from '@/common/StandardModuleTable'
import { Badge } from '@/components/ui/badge'
import { Status } from '@/common/Status'
import { ActionMenu } from '@/common/ActionMenu'
import { TestTube, FileText, CheckCircle2, FlaskConical, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LabOrdersScreenProps {
  onNavigateToSample?: (order: LabOrder) => void
  onNavigateToResult?: (order: LabOrder) => void
}

export const LabOrdersScreen: React.FC<LabOrdersScreenProps> = ({
  onNavigateToSample,
  onNavigateToResult,
}) => {
  const { labOrders } = useLabBilling()
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const handleViewOrder = (order: LabOrder) => {
    setSelectedOrder(order)
    setIsViewModalOpen(true)
  }

  const handleViewReport = (order: LabOrder) => {
    setSelectedOrder(order)
    setIsReportModalOpen(true)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'STAT':
      case 'Emergency':
        return <Badge variant="destructive" className="animate-pulse">{priority}</Badge>
      case 'Urgent':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">{priority}</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const columns: ColumnDef<LabOrder>[] = [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => <span className="font-semibold text-blue-600 dark:text-blue-400">{row.original.orderId}</span>,
    },
    {
      accessorKey: 'patientId',
      header: 'Patient ID',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.patientId}</span>,
    },
    {
      accessorKey: 'patientName',
      header: 'Patient Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.patientName}</div>
          <div className="text-[11px] text-slate-500">{row.original.mobile || 'N/A'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'ageGender',
      header: 'Age / Gender',
    },
    {
      accessorKey: 'visitType',
      header: 'Visit Type',
      cell: ({ row }) => (
        <Badge variant={row.original.visitType === 'IP' ? 'default' : 'outline'}>
          {row.original.visitType}
        </Badge>
      ),
    },
    {
      accessorKey: 'doctor',
      header: 'Doctor',
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-medium">{row.original.doctor}</div>
          <div className="text-[11px] text-slate-400">{row.original.department}</div>
        </div>
      ),
    },
    {
      accessorKey: 'tests',
      header: 'Tests',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.original.tests.join(', ')}
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => getPriorityBadge(row.original.priority),
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => <span className="text-xs text-slate-600 dark:text-slate-400">{row.original.orderDate}</span>,
    },
    {
      accessorKey: 'sampleStatus',
      header: 'Sample Status',
      cell: ({ row }) => {
        const s = row.original.sampleStatus
        if (s === 'Pending Collection') return <Status status="pending" />
        if (s === 'Collected') return <Status status="confirmed" />
        if (s === 'In Lab') return <Status status="in-progress" />
        if (s === 'Rejected') return <Status status="cancelled" />
        return <Badge variant="outline">{s}</Badge>
      },
    },
    {
      accessorKey: 'resultStatus',
      header: 'Result Status',
      cell: ({ row }) => {
        const r = row.original.resultStatus
        if (r === 'Verified') return <Status status="completed" />
        if (r === 'Submitted') return <Status status="scheduled" />
        if (r === 'Draft') return <Status status="pending" />
        if (r === 'Pending Entry') return <Status status="pending" />
        if (r === 'Rejected') return <Status status="cancelled" />
        return <Badge variant="outline">{r}</Badge>
      },
    },
    {
      accessorKey: 'billingStatus',
      header: 'Billing Status',
      cell: ({ row }) => {
        const b = row.original.billingStatus
        if (b === 'Paid') return <Status status="active" />
        if (b === 'Billed') return <Status status="pending" />
        return <Status status="cancelled" />
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={handleViewOrder}
          onCollect={
            onNavigateToSample && row.original.sampleStatus !== 'In Lab'
              ? (item) => onNavigateToSample(item)
              : undefined
          }
          onAck={
            onNavigateToResult && row.original.sampleStatus === 'In Lab'
              ? (item) => onNavigateToResult(item)
              : undefined
          }
          onPrint={row.original.resultStatus === 'Verified' ? handleViewReport : undefined}
        />
      ),
    },
  ]

  const filterFields = [
    { label: 'Visit Type', key: 'visitType', type: 'select' as const, options: ['OP', 'IP'] },
    { label: 'Priority', key: 'priority', type: 'select' as const, options: ['Routine', 'Urgent', 'STAT', 'Emergency'] },
    { label: 'Sample Status', key: 'sampleStatus', type: 'select' as const, options: ['Pending Collection', 'Collected', 'In Lab', 'Rejected'] },
    { label: 'Result Status', key: 'resultStatus', type: 'select' as const, options: ['Pending Entry', 'Draft', 'Submitted', 'Verified', 'Rejected'] },
    { label: 'Billing Status', key: 'billingStatus', type: 'select' as const, options: ['Paid', 'Billed', 'Pending'] },
  ]

  return (
    <div>
      <StandardModuleTable
        title="Lab Orders"
        subtitle="Manage and track patient laboratory test requisitions"
        icon={FlaskConical}
        columns={columns}
        data={labOrders}
        searchPlaceholder="Search Patient Name, ID or Order ID..."
        searchField={(item) => `${item.patientName} ${item.patientId} ${item.orderId}`}
        filterFields={filterFields}
      />

      {/* View Order Modal */}
      {selectedOrder && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <TestTube className="w-5 h-5 text-blue-600" />
                Lab Order Details: {selectedOrder.orderId}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs border rounded p-4 bg-slate-50 dark:bg-slate-900">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Patient:</span> <b>{selectedOrder.patientName}</b></div>
                <div><span className="text-slate-500">Patient ID:</span> <b>{selectedOrder.patientId}</b></div>
                <div><span className="text-slate-500">Age / Gender:</span> <b>{selectedOrder.ageGender}</b></div>
                <div><span className="text-slate-500">Visit ID:</span> <b>{selectedOrder.visitId}</b></div>
                <div><span className="text-slate-500">Doctor:</span> <b>{selectedOrder.doctor}</b></div>
                <div><span className="text-slate-500">Department:</span> <b>{selectedOrder.department}</b></div>
                <div><span className="text-slate-500">Priority:</span> {getPriorityBadge(selectedOrder.priority)}</div>
                <div><span className="text-slate-500">Order Date:</span> <b>{selectedOrder.orderDate}</b></div>
              </div>

              <div className="pt-2 border-t">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Requested Tests:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-800 dark:text-slate-200">
                  {selectedOrder.tests.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {selectedOrder.sampleStatus === 'Pending Collection' && onNavigateToSample && (
                <Button
                  size="sm"
                  onClick={() => {
                    setIsViewModalOpen(false)
                    onNavigateToSample(selectedOrder)
                  }}
                >
                  <FlaskConical className="w-4 h-4 mr-1" />
                  Collect Sample
                </Button>
              )}
              {selectedOrder.sampleStatus === 'In Lab' && onNavigateToResult && (
                <Button
                  size="sm"
                  onClick={() => {
                    setIsViewModalOpen(false)
                    onNavigateToResult(selectedOrder)
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Enter Result
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Report Modal */}
      {selectedOrder && (
        <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Laboratory Test Report Preview
              </DialogTitle>
            </DialogHeader>

            <div className="border p-6 rounded bg-white dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="font-bold text-lg text-blue-950 dark:text-blue-300">SRM ENTERPRISE HOSPITAL</h3>
                  <p className="text-xs text-slate-500">Department of Laboratory Medicine</p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Report ID: REP-{selectedOrder.orderId}</div>
                  <div className="text-slate-500">Date: {selectedOrder.verifiedDate || selectedOrder.orderDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded">
                <div><b>Patient Name:</b> {selectedOrder.patientName}</div>
                <div><b>Patient ID:</b> {selectedOrder.patientId}</div>
                <div><b>Age / Gender:</b> {selectedOrder.ageGender}</div>
                <div><b>Referred By:</b> {selectedOrder.doctor}</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 border-b pb-1">Test Parameters & Results</h4>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 dark:bg-slate-800">
                      <th className="p-2">Parameter</th>
                      <th className="p-2">Result</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Reference Range</th>
                      <th className="p-2">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.parameters?.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="p-2 font-medium">{p.parameter}</td>
                        <td className="p-2 font-bold">{p.result}</td>
                        <td className="p-2">{p.unit}</td>
                        <td className="p-2 text-slate-500">{p.referenceRange}</td>
                        <td className="p-2">
                          <Badge variant={p.flag === 'Normal' ? 'outline' : 'destructive'}>{p.flag}</Badge>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">No parameter results attached.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between text-xs text-slate-500 pt-4 border-t">
                <div>Lab Technician: <b>{selectedOrder.technician || 'Ramesh'}</b></div>
                <div>Verified By: <b>{selectedOrder.verifiedBy || 'Dr. Hema (Pathologist)'}</b></div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => window.print()} className="gap-1">
                <Printer className="w-4 h-4" /> Print Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
