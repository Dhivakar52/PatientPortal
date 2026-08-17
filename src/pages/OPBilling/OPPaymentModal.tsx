import React, { useState } from 'react'
import type { OPBill, PaymentMode } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { DollarSign, CheckCircle2 } from 'lucide-react'

interface OPPaymentModalProps {
  isOpen: boolean
  bill: OPBill
  onClose: () => void
}

export const OPPaymentModal: React.FC<OPPaymentModalProps> = ({
  isOpen,
  bill,
  onClose,
}) => {
  const { addOPPayment } = useLabBilling()

  const [paymentAmount, setPaymentAmount] = useState(String(bill.balance))
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI')
  const [transactionRef, setTransactionRef] = useState('')
  const [remarks, setRemarks] = useState('')

  React.useEffect(() => {
    if (isOpen && bill) {
      setPaymentAmount(String(bill.balance))
      setTransactionRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`)
      setRemarks('')
    }
  }, [isOpen, bill])

  const handlePay = () => {
    const amt = Number(paymentAmount) || 0
    if (amt <= 0) return
    const isSuccess = addOPPayment(bill.billNo, amt, paymentMode, transactionRef, remarks)
    if (isSuccess) onClose()
  }

  const isFullyPaid = bill.balance <= 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Collect OP Bill Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-2">
          {/* Bill Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Bill Number:</span>
              <b className="font-mono text-blue-600">{bill.billNo}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <b>{bill.patientName} ({bill.patientId})</b>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-slate-500">Total Amount:</span>
              <b>₹{bill.billAmount}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Already Paid:</span>
              <b className="text-emerald-600">₹{bill.paidAmount}</b>
            </div>
            <div className="flex justify-between text-sm font-bold text-amber-600 pt-1 border-t">
              <span>Outstanding Balance:</span>
              <span>₹{bill.balance}</span>
            </div>
          </div>

          {isFullyPaid ? (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-center font-medium">
              This bill is already fully paid. No additional payment required.
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <FieldLabel required>Payment Amount (₹)</FieldLabel>
                <TextField
                  value={paymentAmount}
                  onChange={setPaymentAmount}
                  placeholder={`Max ₹${bill.balance}`}
                />
                {Number(paymentAmount) > bill.balance && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    Warning: Payment cannot exceed outstanding balance of ₹{bill.balance}.
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required>Payment Mode</FieldLabel>
                <SelectField
                  options={['Cash', 'Card', 'UPI', 'Bank Transfer', 'Insurance']}
                  value={paymentMode}
                  onChange={(val) => setPaymentMode(val as PaymentMode)}
                />
              </div>

              <div>
                <FieldLabel>Transaction Reference / Txn ID</FieldLabel>
                <TextField value={transactionRef} onChange={setTransactionRef} />
              </div>

              <div>
                <FieldLabel>Payment Remarks</FieldLabel>
                <TextField value={remarks} onChange={setRemarks} placeholder="Optional notes" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isFullyPaid || Number(paymentAmount) <= 0 || Number(paymentAmount) > bill.balance}
            onClick={handlePay}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1"
          >
            <CheckCircle2 className="w-4 h-4" /> Collect ₹{paymentAmount || 0}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
