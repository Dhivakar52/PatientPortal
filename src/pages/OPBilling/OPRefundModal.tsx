import React, { useState } from 'react'
import type { OPBill, PaymentMode } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { DeleteConfirmationDialog } from '@/common/DeleteConfirmationDialog'
import { RotateCcw, XCircle } from 'lucide-react'

interface OPRefundModalProps {
  isOpen: boolean
  bill: OPBill
  onClose: () => void
}

export const OPRefundModal: React.FC<OPRefundModalProps> = ({
  isOpen,
  bill,
  onClose,
}) => {
  const { addOPRefund, cancelOPBill } = useLabBilling()

  const [refundAmount, setRefundAmount] = useState(String(bill.paidAmount))
  const [refundMode, setRefundMode] = useState<PaymentMode>('Cash')
  const [reason, setReason] = useState('Patient cancelled appointment / wrong service requested')
  const [remarks, setRemarks] = useState('')

  React.useEffect(() => {
    if (isOpen && bill) {
      setRefundAmount(String(bill.paidAmount))
      setRemarks('')
    }
  }, [isOpen, bill])

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'refund' | 'cancel'>('refund')

  const handleExecute = () => {
    if (actionType === 'refund') {
      const amt = Number(refundAmount) || 0
      if (amt <= 0 || amt > bill.paidAmount) return
      const isSuccess = addOPRefund(bill.billNo, amt, refundMode, reason, remarks)
      if (isSuccess) {
        setIsConfirmDialogOpen(false)
        onClose()
      }
    } else {
      cancelOPBill(bill.billNo, reason)
      setIsConfirmDialogOpen(false)
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              OP Bill Refund &amp; Cancellation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Number:</span>
                <b className="font-mono text-blue-600">{bill.billNo}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <b>{bill.patientName}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Date:</span>
                <b>{bill.billDate}</b>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold border-t pt-1">
                <span>Total Paid Amount:</span>
                <span>₹{bill.paidAmount}</span>
              </div>
            </div>

            {bill.billStatus === 'Cancelled' ? (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded text-center font-medium">
                This bill is already cancelled. Cancelled bills cannot accept further transactions.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <FieldLabel required>Refund Amount (₹)</FieldLabel>
                  <TextField
                    value={refundAmount}
                    onChange={setRefundAmount}
                    placeholder={`Max ₹${bill.paidAmount}`}
                  />
                  {Number(refundAmount) > bill.paidAmount && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      Error: Refund amount cannot exceed total paid amount of ₹{bill.paidAmount}.
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel required>Refund Mode</FieldLabel>
                  <SelectField
                    options={['Cash', 'Card', 'UPI', 'Bank Transfer']}
                    value={refundMode}
                    onChange={(val) => setRefundMode(val as PaymentMode)}
                  />
                </div>

                <div>
                  <FieldLabel required>Reason for Refund / Cancellation</FieldLabel>
                  <SelectField
                    options={[
                      'Patient cancelled appointment / wrong service requested',
                      'Service not rendered',
                      'Billing error / Duplicate charge',
                      'Doctor unavailable',
                    ]}
                    value={reason}
                    onChange={setReason}
                  />
                </div>

                <div>
                  <FieldLabel>Remarks</FieldLabel>
                  <TextField value={remarks} onChange={setRemarks} placeholder="Optional audit notes" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>

            {bill.billStatus !== 'Cancelled' && (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setActionType('cancel')
                    setIsConfirmDialogOpen(true)
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Cancel Bill Only
                </Button>

                <Button
                  size="sm"
                  disabled={Number(refundAmount) <= 0 || Number(refundAmount) > bill.paidAmount}
                  onClick={() => {
                    setActionType('refund')
                    setIsConfirmDialogOpen(true)
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Process Refund ₹{refundAmount}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleExecute}
        title={actionType === 'refund' ? 'Confirm OP Refund' : 'Confirm OP Bill Cancellation'}
        description={`Are you sure you want to ${actionType === 'refund' ? `refund ₹${refundAmount}` : 'cancel this bill'} for ${bill.patientName}?`}
        itemName={bill.billNo}
        confirmLabel={actionType === 'refund' ? 'Confirm Refund' : 'Confirm Cancellation'}
      />
    </>
  )
}
