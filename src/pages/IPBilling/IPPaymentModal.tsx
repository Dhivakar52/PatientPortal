import React, { useState } from 'react'
import type { IPAccount, PaymentMode } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { DollarSign, CheckCircle2 } from 'lucide-react'

interface IPPaymentModalProps {
  isOpen: boolean
  account: IPAccount
  onClose: () => void
}

export const IPPaymentModal: React.FC<IPPaymentModalProps> = ({
  isOpen,
  account,
  onClose,
}) => {
  const { addIPPayment } = useLabBilling()

  const [amount, setAmount] = useState(String(account.outstanding))
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI')
  const [transactionRef, setTransactionRef] = useState('')
  const [remarks, setRemarks] = useState('Inpatient Deposit Payment')

  React.useEffect(() => {
    if (isOpen && account) {
      setAmount(String(account.outstanding))
      setTransactionRef(`TXN-IP-${Math.floor(100000 + Math.random() * 900000)}`)
      setRemarks('Inpatient Deposit Payment')
    }
  }, [isOpen, account])

  const handlePay = () => {
    const amt = Number(amount) || 0
    if (amt <= 0) return
    const isSuccess = addIPPayment(account.ipNo, amt, paymentMode, transactionRef, remarks)
    if (isSuccess) onClose()
  }

  const isFullyPaid = account.outstanding <= 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-5 h-5 text-[#2952CC]" />
            Collect Inpatient Advance Deposit / Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-2">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">IP Number:</span>
              <b className="font-mono text-[#2952CC]">{account.ipNo}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient Name:</span>
              <b>{account.patientName}</b>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-slate-500">Total Charges:</span>
              <b>₹{account.totalCharges}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Already Paid Deposits:</span>
              <b className="text-emerald-600">₹{account.paidAmount}</b>
            </div>
            <div className="flex justify-between text-sm font-bold text-amber-600 pt-1 border-t">
              <span>Outstanding Balance:</span>
              <span>₹{account.outstanding}</span>
            </div>
          </div>

          {isFullyPaid ? (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-center font-medium">
              No outstanding balance on this inpatient account.
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <FieldLabel required>Deposit Payment Amount (₹)</FieldLabel>
                <TextField
                  value={amount}
                  onChange={setAmount}
                  placeholder={`Max ₹${account.outstanding}`}
                />
                {Number(amount) > account.outstanding && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    Error: Overpayment protection! Payment cannot exceed outstanding balance of ₹{account.outstanding}.
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
                <FieldLabel>Remarks</FieldLabel>
                <TextField value={remarks} onChange={setRemarks} placeholder="Deposit notes" />
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
            disabled={isFullyPaid || Number(amount) <= 0 || Number(amount) > account.outstanding}
            onClick={handlePay}
            className="bg-[#2952CC] hover:bg-blue-700 text-white cursor-pointer gap-1"
          >
            <CheckCircle2 className="w-4 h-4" /> Collect ₹{amount || 0}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
