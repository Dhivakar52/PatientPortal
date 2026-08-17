import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { IPAccount } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { StandardModuleTable } from '@/common/StandardModuleTable'
import { Status } from '@/common/Status'
import { ActionMenu } from '@/common/ActionMenu'
import { Button } from '@/components/ui/button'
import { Building2, DollarSign } from 'lucide-react'
import { IPPaymentModal } from './IPPaymentModal'
import { IPRefundModal } from './IPRefundModal'

interface InpatientAccountsScreenProps {
  onNavigateToDetail?: (ipAccount: IPAccount) => void
  onNavigateToInterim?: (ipAccount: IPAccount) => void
  onNavigateToFinal?: (ipAccount: IPAccount) => void
}

export const InpatientAccountsScreen: React.FC<InpatientAccountsScreenProps> = ({
  onNavigateToDetail,
  onNavigateToInterim,
  onNavigateToFinal,
}) => {
  const { ipAccounts } = useLabBilling()

  const [selectedAccount, setSelectedAccount] = useState<IPAccount | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  const handleOpenPayment = (acc: IPAccount) => {
    setSelectedAccount(acc)
    setIsPaymentModalOpen(true)
  }

  const handleOpenRefund = (acc: IPAccount) => {
    setSelectedAccount(acc)
    setIsRefundModalOpen(true)
  }

  const columns: ColumnDef<IPAccount>[] = [
    {
      accessorKey: 'ipNo',
      header: 'IP Number',
      cell: ({ row }) => <span className="font-semibold text-[#2952CC] font-mono text-xs">{row.original.ipNo}</span>,
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
          <div className="text-[11px] text-slate-500">{row.original.ageGender}</div>
        </div>
      ),
    },
    {
      accessorKey: 'admissionDate',
      header: 'Admission Date',
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.admissionDate}</span>,
    },
    {
      id: 'wardRoomBed',
      header: 'Ward / Room / Bed',
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-semibold">{row.original.ward}</div>
          <div className="text-[11px] text-slate-500">{row.original.room} • {row.original.bed}</div>
        </div>
      ),
    },
    {
      accessorKey: 'doctor',
      header: 'Attending Doctor',
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-medium">{row.original.doctor}</div>
          <div className="text-[11px] text-slate-400">{row.original.department}</div>
        </div>
      ),
    },
    {
      accessorKey: 'totalCharges',
      header: 'Total Charges',
      cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">₹{row.original.totalCharges}</span>,
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid Amount',
      cell: ({ row }) => <span className="font-semibold text-emerald-600">₹{row.original.paidAmount}</span>,
    },
    {
      accessorKey: 'outstanding',
      header: 'Outstanding',
      cell: ({ row }) => (
        <span className={row.original.outstanding > 0 ? 'font-bold text-amber-600' : 'text-slate-400'}>
          ₹{row.original.outstanding}
        </span>
      ),
    },
    {
      accessorKey: 'accountStatus',
      header: 'Account Status',
      cell: ({ row }) => {
        const s = row.original.accountStatus
        if (s === 'Active') return <Status status="admitted" />
        if (s === 'Interim Billed') return <Status status="pending" />
        if (s === 'Ready for Discharge') return <Status status="scheduled" />
        if (s === 'Discharged') return <Status status="discharged" />
        return <Status status="cancelled" />
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {onNavigateToDetail && (
            <Button size="xs" variant="outline" onClick={() => onNavigateToDetail(row.original)} className="h-7 text-[11px] px-2">
              View
            </Button>
          )}

          {row.original.outstanding > 0 && (
            <Button size="xs" variant="outline" onClick={() => handleOpenPayment(row.original)} className="h-7 text-[11px] px-2">
              <DollarSign className="w-3 h-3 mr-0.5 text-emerald-600" /> Pay
            </Button>
          )}

          <ActionMenu
            item={row.original}
            onView={onNavigateToDetail ? (item) => onNavigateToDetail(item) : undefined}
            onAuditLog={onNavigateToInterim ? (item) => onNavigateToInterim(item) : undefined}
            onPrint={onNavigateToFinal ? (item) => onNavigateToFinal(item) : undefined}
            onRevisitCancellation={handleOpenRefund}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <StandardModuleTable
        title="Inpatient Accounts"
        subtitle="Manage inpatient accounts, ward bed charges, deposits, interim bills, and final discharge billing"
        icon={Building2}
        columns={columns}
        data={ipAccounts}
        searchPlaceholder="Search IP No, Patient Name, Ward or ID..."
        searchField={(item) => `${item.ipNo} ${item.patientName} ${item.patientId} ${item.ward}`}
      />

      {/* IP Payment Modal */}
      {selectedAccount && (
        <IPPaymentModal
          isOpen={isPaymentModalOpen}
          account={selectedAccount}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {/* IP Refund / Cancellation Modal */}
      {selectedAccount && (
        <IPRefundModal
          isOpen={isRefundModalOpen}
          account={selectedAccount}
          onClose={() => setIsRefundModalOpen(false)}
        />
      )}
    </div>
  )
}
