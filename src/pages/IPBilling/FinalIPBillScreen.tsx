import React, { useState } from 'react'
import type { IPAccount, FinalIPBill } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldLabel, SelectField } from '@/components/FormPrimitives'
import { Printer, Download, Building2, ArrowLeft, ShieldCheck } from 'lucide-react'

interface FinalIPBillScreenProps {
  initialAccount?: IPAccount | null
  onBack?: () => void
}

export const FinalIPBillScreen: React.FC<FinalIPBillScreenProps> = ({
  initialAccount,
  onBack,
}) => {
  const { ipAccounts, generateFinalIPBill } = useLabBilling()

  const [selectedIpNo, setSelectedIpNo] = useState<string>(
    initialAccount ? initialAccount.ipNo : ipAccounts[0]?.ipNo || ''
  )
  const currentAccount = ipAccounts.find((a) => a.ipNo === selectedIpNo) || initialAccount

  const [finalBill, setFinalBill] = useState<FinalIPBill | null>(null)

  const handleGenerateFinal = () => {
    if (!currentAccount) return
    const bill = generateFinalIPBill(currentAccount.ipNo)
    setFinalBill(bill)
  }

  const grandTotal = currentAccount
    ? currentAccount.totalCharges - currentAccount.discount - currentAccount.insuranceAdjustment + currentAccount.tax
    : 0

  const finalPayable = currentAccount ? Math.max(0, grandTotal - currentAccount.paidAmount) : 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#2952CC]" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Final IP Settlement &amp; Discharge Invoice</h2>
              <p className="text-xs text-slate-500">Calculate gross charges, insurance pre-authorization, net final payable, and discharge clearance</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FieldLabel>Select Inpatient Account:</FieldLabel>
          <SelectField
            options={ipAccounts.map((a) => a.ipNo)}
            value={selectedIpNo}
            onChange={setSelectedIpNo}
          />
        </div>
      </div>

      {currentAccount ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Demographics Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Patient Demographics</span>
                <Badge variant="outline">{currentAccount.ipNo}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs">
              <div><span className="text-slate-500 block">Patient ID / Name:</span> <b>{currentAccount.patientId} • {currentAccount.patientName}</b></div>
              <div><span className="text-slate-500 block">Age / Gender:</span> <b>{currentAccount.ageGender}</b></div>
              <div><span className="text-slate-500 block">Admission Date:</span> <b>{currentAccount.admissionDate}</b></div>
              <div><span className="text-slate-500 block">Discharge Date:</span> <b>{new Date().toISOString().split('T')[0]}</b></div>
              <div><span className="text-slate-500 block">Ward / Room / Bed:</span> <b>{currentAccount.ward} / {currentAccount.room} / {currentAccount.bed}</b></div>
              <div><span className="text-slate-500 block">Primary Physician:</span> <b>{currentAccount.doctor}</b></div>
            </CardContent>
          </Card>

          {/* Final Settlement Summary Column */}
          <Card className="lg:col-span-2 border-blue-200 dark:border-blue-900 shadow-md">
            <CardHeader className="pb-3 border-b bg-blue-50/50 dark:bg-blue-950/30">
              <CardTitle className="text-sm font-bold text-[#2952CC] dark:text-blue-200">
                Final Settlement Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Gross Total Charges:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">₹{currentAccount.totalCharges}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Special Discount:</span>
                <span className="font-semibold text-emerald-600">- ₹{currentAccount.discount}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Insurance Adjustment:</span>
                <span className="font-semibold text-[#2952CC]">- ₹{currentAccount.insuranceAdjustment}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 border-b pb-2">
                <span>GST / Tax:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+ ₹{currentAccount.tax}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-slate-100 pt-1">
                <span>Grand Total Bill:</span>
                <span>₹{grandTotal}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Deposits / Paid Amount:</span>
                <span className="font-semibold text-emerald-600">₹{currentAccount.paidAmount}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-[#2952CC] pt-2 border-t">
                <span>Net Final Payable:</span>
                <span className={finalPayable > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                  ₹{finalPayable}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              {!finalBill ? (
                <Button
                  onClick={handleGenerateFinal}
                  className="w-full bg-[#2952CC] hover:bg-blue-700 text-white font-bold cursor-pointer gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Generate Final IP Bill
                </Button>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Button size="sm" onClick={() => window.print()} className="flex-1 gap-1">
                    <Printer className="w-4 h-4" /> Print Final Invoice
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => alert('Downloading Final PDF...')} className="flex-1 gap-1">
                    <Download className="w-4 h-4" /> Download PDF Statement
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500 text-xs">
          No inpatient account selected for final settlement.
        </Card>
      )}
    </div>
  )
}
