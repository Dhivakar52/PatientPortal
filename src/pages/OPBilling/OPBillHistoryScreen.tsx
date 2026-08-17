import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { OPBill } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { StandardModuleTable } from '@/common/StandardModuleTable'
import { Status } from '@/common/Status'
import { ActionMenu } from '@/common/ActionMenu'
// import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OPPaymentModal } from './OPPaymentModal'
import { OPRefundModal } from './OPRefundModal'
import { Receipt, Printer, DollarSign } from 'lucide-react'

export const OPBillHistoryScreen: React.FC = () => {
  const { opBills } = useLabBilling()

  const [selectedBill, setSelectedBill] = useState<OPBill | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  const handleViewBill = (bill: OPBill) => {
    setSelectedBill(bill)
    setIsViewModalOpen(true)
  }

  const handleOpenPayment = (bill: OPBill) => {
    setSelectedBill(bill)
    setIsPaymentModalOpen(true)
  }

  const handleOpenRefund = (bill: OPBill) => {
    setSelectedBill(bill)
    setIsRefundModalOpen(true)
  }

  const columns: ColumnDef<OPBill>[] = [
    {
      accessorKey: 'billNo',
      header: 'Bill Number',
      cell: ({ row }) => <span className="font-semibold text-blue-600 font-mono text-xs">{row.original.billNo}</span>,
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
          <div className="text-[11px] text-slate-500">{row.original.mobile}</div>
        </div>
      ),
    },
    {
      accessorKey: 'visitId',
      header: 'Visit ID',
      cell: ({ row }) => <span className="text-xs">{row.original.visitId}</span>,
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
      accessorKey: 'billAmount',
      header: 'Bill Amount',
      cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">₹{row.original.billAmount}</span>,
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid Amount',
      cell: ({ row }) => <span className="font-semibold text-emerald-600">₹{row.original.paidAmount}</span>,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className={row.original.balance > 0 ? 'font-bold text-amber-600' : 'text-slate-400'}>
          ₹{row.original.balance}
        </span>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment Status',
      cell: ({ row }) => {
        const s = row.original.paymentStatus
        if (s === 'Paid') return <Status status="completed" />
        if (s === 'Partial') return <Status status="pending" />
        return <Status status="cancelled" />
      },
    },
    {
      accessorKey: 'billStatus',
      header: 'Bill Status',
      cell: ({ row }) => {
        const b = row.original.billStatus
        if (b === 'Active') return <Status status="active" />
        if (b === 'Cancelled') return <Status status="cancelled" />
        return <Status status="rescheduled" />
      },
    },
    {
      accessorKey: 'billDate',
      header: 'Bill Date',
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.billDate}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.balance > 0 && row.original.billStatus === 'Active' && (
            <Button size="xs" variant="outline" onClick={() => handleOpenPayment(row.original)} className="h-7 text-[11px] px-2">
              <DollarSign className="w-3 h-3 mr-0.5" /> Pay
            </Button>
          )}
          <ActionMenu
            item={row.original}
            onView={handleViewBill}
            onPrint={handleViewBill}
            onRevisitCancellation={
              row.original.billStatus === 'Active' ? handleOpenRefund : undefined
            }
          />
        </div>
      ),
    },
  ]

  const filterFields = [
    { label: 'Payment Status', key: 'paymentStatus', type: 'select' as const, options: ['Paid', 'Partial', 'Unpaid'] },
    { label: 'Bill Status', key: 'billStatus', type: 'select' as const, options: ['Active', 'Cancelled', 'Refunded'] },
  ]

  return (
    <div>
      <StandardModuleTable
        title="OP Bill History"
        // subtitle="Search and view historical outpatient billing receipts, payment statuses, and cancellations"
        icon={Receipt}
        columns={columns}
        data={opBills}
        searchPlaceholder="Search Bill No, Patient Name or ID..."
        searchField={(item) => `${item.billNo} ${item.patientName} ${item.patientId}`}
        filterFields={filterFields}
      />

      {/* Detailed Bill View Modal */}
      {selectedBill && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Receipt className="w-5 h-5 text-blue-600" />
                Outpatient Billing Receipt: {selectedBill.billNo}
              </DialogTitle>
            </DialogHeader>

            <div className="border p-6 rounded bg-white dark:bg-slate-900 space-y-4 text-xs">
              <div className="flex justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-base text-blue-950 dark:text-blue-300">SRM ENTERPRISE HOSPITAL</h3>
                  <p className="text-slate-500">OP Cashier &amp; Billing Counter</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-blue-600">{selectedBill.billNo}</div>
                  <div className="text-slate-500">Date: {selectedBill.billDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                <div><b>Patient Name:</b> {selectedBill.patientName}</div>
                <div><b>Patient ID:</b> {selectedBill.patientId}</div>
                <div><b>Visit ID:</b> {selectedBill.visitId}</div>
                <div><b>Doctor:</b> {selectedBill.doctor} ({selectedBill.department})</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1 mb-2">Billed Items</h4>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 dark:bg-slate-800">
                      <th className="p-2">Code</th>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2">Rate</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((i) => (
                      <tr key={i.id} className="border-b">
                        <td className="p-2 font-mono text-blue-600">{i.serviceCode}</td>
                        <td className="p-2 font-medium">{i.serviceName}</td>
                        <td className="p-2 text-center">{i.quantity}</td>
                        <td className="p-2">₹{i.unitPrice}</td>
                        <td className="p-2 text-right font-bold">₹{i.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-3 space-y-1 text-right">
                <div>Subtotal: <b>₹{selectedBill.subtotal}</b></div>
                <div>Discount: <b className="text-emerald-600">- ₹{selectedBill.discount}</b></div>
                <div className="text-sm font-bold text-blue-900 dark:text-blue-300">Grand Total: ₹{selectedBill.billAmount}</div>
                <div>Paid Amount: <b className="text-emerald-600">₹{selectedBill.paidAmount}</b></div>
                <div>Balance Outstanding: <b className={selectedBill.balance > 0 ? 'text-amber-600' : 'text-slate-600'}>₹{selectedBill.balance}</b></div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => window.print()} className="gap-1">
                <Printer className="w-4 h-4" /> Print Receipt
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Modal */}
      {selectedBill && (
        <OPPaymentModal
          isOpen={isPaymentModalOpen}
          bill={selectedBill}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {/* Refund / Cancellation Modal */}
      {selectedBill && (
        <OPRefundModal
          isOpen={isRefundModalOpen}
          bill={selectedBill}
          onClose={() => setIsRefundModalOpen(false)}
        />
      )}
    </div>
  )
}
