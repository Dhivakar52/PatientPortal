import React, { useState } from 'react'
import type { IPAccount, PaymentMode } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { DeleteConfirmationDialog } from '@/common/DeleteConfirmationDialog'
import { RotateCcw } from 'lucide-react'

interface IPRefundModalProps {
  isOpen: boolean
  account: IPAccount
  onClose: () => void
}

export const IPRefundModal: React.FC<IPRefundModalProps> = ({
  isOpen,
  account,
  onClose,
}) => {
  const { addIPRefund } = useLabBilling()

  const [refundAmount, setRefundAmount] = useState(String(account.paidAmount))
  const [refundMode, setRefundMode] = useState<PaymentMode>('Bank Transfer')
  const [reason, setReason] = useState('Admission cancelled / Deposit refund')
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  React.useEffect(() => {
    if (isOpen && account) {
      setRefundAmount(String(account.paidAmount))
    }
  }, [isOpen, account])

  const handleExecute = () => {
    const amt = Number(refundAmount) || 0
    if (amt <= 0 || amt > account.paidAmount) return
    const isSuccess = addIPRefund(account.ipNo, amt, refundMode, reason)
    if (isSuccess) {
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
              IP Deposit Refund / Account Cancellation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">IP Number:</span>
                <b className="font-mono text-[#2952CC]">{account.ipNo}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <b>{account.patientName}</b>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold border-t pt-1">
                <span>Total Paid Deposits:</span>
                <span>₹{account.paidAmount}</span>
              </div>
            </div>

            {account.accountStatus === 'Cancelled' ? (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded text-center font-medium">
                This inpatient account is cancelled. No further transactions allowed.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <FieldLabel required>Refund Amount (₹)</FieldLabel>
                  <TextField
                    value={refundAmount}
                    onChange={setRefundAmount}
                    placeholder={`Max ₹${account.paidAmount}`}
                  />
                  {Number(refundAmount) > account.paidAmount && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      Error: Refund amount cannot exceed paid deposit balance of ₹{account.paidAmount}.
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
                  <FieldLabel required>Reason for Refund</FieldLabel>
                  <SelectField
                    options={[
                      'Admission cancelled / Deposit refund',
                      'Overpaid deposit refund on discharge',
                      'Billing correction',
                    ]}
                    value={reason}
                    onChange={setReason}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {account.accountStatus !== 'Cancelled' && (
              <Button
                size="sm"
                disabled={Number(refundAmount) <= 0 || Number(refundAmount) > account.paidAmount}
                onClick={() => setIsConfirmDialogOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Refund ₹{refundAmount}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleExecute}
        title="Confirm Inpatient Refund"
        description={`Are you sure you want to refund ₹${refundAmount} for IP account ${account.ipNo}?`}
        itemName={account.patientName}
        confirmLabel="Confirm Refund"
      />
    </>
  )
}
