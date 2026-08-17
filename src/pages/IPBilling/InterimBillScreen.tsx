import React, { useState } from 'react'
import type { IPAccount, InterimBill } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldLabel, SelectField } from '@/components/FormPrimitives'
import { Printer, Download, CheckCircle2, FileText, ArrowLeft } from 'lucide-react'

interface InterimBillScreenProps {
  initialAccount?: IPAccount | null
  onBack?: () => void
}

export const InterimBillScreen: React.FC<InterimBillScreenProps> = ({
  initialAccount,
  onBack,
}) => {
  const { ipAccounts, generateInterimBill } = useLabBilling()

  const [selectedIpNo, setSelectedIpNo] = useState<string>(
    initialAccount ? initialAccount.ipNo : ipAccounts[0]?.ipNo || ''
  )
  const currentAccount = ipAccounts.find((a) => a.ipNo === selectedIpNo) || initialAccount

  const [generatedBill, setGeneratedBill] = useState<InterimBill | null>(null)

  const handleGenerate = () => {
    if (!currentAccount) return
    const bill = generateInterimBill(currentAccount.ipNo)
    setGeneratedBill(bill)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#2952CC]" />
              Interim Inpatient Billing Statement
            </h2>
            <p className="text-xs text-slate-500">Generate periodic interim bill statement for running inpatient stay</p>
          </div>
        </div>
      </div>

      {/* Select IP Account */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <FieldLabel required>Select Active IP Account</FieldLabel>
            <SelectField
              options={ipAccounts.map((a) => a.ipNo)}
              value={selectedIpNo}
              onChange={(val) => {
                setSelectedIpNo(val)
                setGeneratedBill(null)
              }}
              placeholder="Choose IP Number"
            />
          </div>
        </CardContent>
      </Card>

      {currentAccount ? (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="pb-3 border-b bg-blue-50/50 dark:bg-blue-950/30">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Interim Bill Running Summary</span>
              <Badge variant="outline" className="font-mono text-[#2952CC]">{currentAccount.ipNo}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded">
              <div><span className="text-slate-500 block">Patient Name:</span> <b>{currentAccount.patientName}</b></div>
              <div><span className="text-slate-500 block">Patient ID:</span> <b>{currentAccount.patientId}</b></div>
              <div><span className="text-slate-500 block">Admission Date:</span> <b>{currentAccount.admissionDate}</b></div>
              <div><span className="text-slate-500 block">Ward &amp; Bed:</span> <b>{currentAccount.ward} ({currentAccount.bed})</b></div>
            </div>

            <div className="border rounded p-4 space-y-3 bg-white dark:bg-slate-900">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Current Total Charges To Date:</span>
                <span className="font-semibold">₹{currentAccount.totalCharges}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Less Discount:</span>
                <span className="font-semibold text-emerald-600">- ₹{currentAccount.discount}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Less Deposits / Payments Collected:</span>
                <span className="font-semibold text-emerald-600">- ₹{currentAccount.paidAmount}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-[#2952CC] pt-2">
                <span>Current Running Outstanding Payable:</span>
                <span>₹{currentAccount.outstanding}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-between gap-3 pt-2">
            <Button
              onClick={handleGenerate}
              className="bg-[#2952CC] hover:bg-blue-700 text-white font-bold gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Generate Interim Bill Statement
            </Button>

            {generatedBill && (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => window.print()} className="gap-1">
                  <Printer className="w-4 h-4" /> Print Interim Statement
                </Button>
                <Button size="sm" variant="secondary" onClick={() => alert('Downloading Interim PDF...')} className="gap-1">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card className="p-8 text-center text-slate-500 text-xs">
          No active inpatient account selected.
        </Card>
      )}
    </div>
  )
}
