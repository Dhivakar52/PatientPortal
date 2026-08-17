import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { LabOrder } from '@/types/lab.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { StandardModuleTable } from '@/common/StandardModuleTable'
import { Badge } from '@/components/ui/badge'
import { Status } from '@/common/Status'
import { ActionMenu } from '@/common/ActionMenu'
import { DeleteConfirmationDialog } from '@/common/DeleteConfirmationDialog'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

export const ResultVerificationScreen: React.FC = () => {
  const { labOrders, verifyLabResult } = useLabBilling()

  // Filter verification queue
  const verificationQueue = labOrders.filter(
    (o) => o.resultStatus === 'Submitted' || o.resultStatus === 'Verified' || o.resultStatus === 'Rejected'
  )

  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const handleVerify = () => {
    if (!selectedOrder) return
    verifyLabResult(selectedOrder.orderId, 'Dr. Hema (Pathologist)', false)
    setIsVerifyDialogOpen(false)
  }

  const handleReject = () => {
    if (!selectedOrder) return
    verifyLabResult(selectedOrder.orderId, 'Dr. Hema (Pathologist)', true, 'Parameter results out of clinical bounds, recollect suggested.')
    setIsRejectDialogOpen(false)
  }

  const columns: ColumnDef<LabOrder>[] = [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => <span className="font-semibold text-blue-600">{row.original.orderId}</span>,
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.patientName}</div>
          <div className="text-[11px] text-slate-500">{row.original.patientId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'tests',
      header: 'Test',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-xs font-medium">
          {row.original.tests.join(', ')}
        </div>
      ),
    },
    {
      accessorKey: 'resultStatus',
      header: 'Result Status',
      cell: ({ row }) => {
        const r = row.original.resultStatus
        if (r === 'Verified') return <Status status="completed" />
        if (r === 'Submitted') return <Status status="scheduled" />
        if (r === 'Rejected') return <Status status="cancelled" />
        return <Badge variant="outline">{r}</Badge>
      },
    },
    {
      id: 'criticalFlag',
      header: 'Critical Flag',
      cell: ({ row }) => {
        const hasCritical = row.original.parameters?.some((p) => p.flag === 'Critical' || p.flag === 'High')
        if (hasCritical) {
          return (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> Flagged
            </Badge>
          )
        }
        return <Badge variant="secondary">Normal</Badge>
      },
    },
    {
      accessorKey: 'technician',
      header: 'Technician',
      cell: ({ row }) => <span className="text-xs">{row.original.technician || 'Ramesh (Lab)'}</span>,
    },
    {
      accessorKey: 'submittedDate',
      header: 'Submitted Date',
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.submittedDate || row.original.orderDate}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onValidate={
            row.original.resultStatus === 'Submitted'
              ? (item) => {
                  setSelectedOrder(item)
                  setIsVerifyDialogOpen(true)
                }
              : undefined
          }
          onReject={
            row.original.resultStatus === 'Submitted'
              ? (item) => {
                  setSelectedOrder(item)
                  setIsRejectDialogOpen(true)
                }
              : undefined
          }
        />
      ),
    },
  ]

  return (
    <div>
      <StandardModuleTable
        title="Result Verification"
        subtitle="Pathologist verification queue for submitted laboratory reports"
        icon={ShieldCheck}
        columns={columns}
        data={verificationQueue}
        searchPlaceholder="Search Patient Name or Order ID..."
        searchField={(item) => `${item.patientName} ${item.orderId}`}
      />

      {/* Verify Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        onConfirm={handleVerify}
        title="Authorize & Verify Lab Report"
        description="Are you sure you want to approve and sign off on this laboratory result report?"
        itemName={selectedOrder?.orderId}
        confirmLabel="Verify & Release Report"
      />

      {/* Reject Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={handleReject}
        title="Reject Result Verification"
        description="Rejecting will send this test back to Lab Technician for re-testing or parameter re-check."
        itemName={selectedOrder?.orderId}
        confirmLabel="Reject Result"
      />
    </div>
  )
}
