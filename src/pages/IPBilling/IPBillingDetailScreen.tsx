import React, { useState } from 'react'
import type { IPAccount } from '@/types/billing.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { Building2, Plus, ArrowLeft, Receipt } from 'lucide-react'

interface IPBillingDetailScreenProps {
  initialAccount?: IPAccount | null
  onBack?: () => void
}

export const IPBillingDetailScreen: React.FC<IPBillingDetailScreenProps> = ({
  initialAccount,
  onBack,
}) => {
  const { ipAccounts, addIPCharge } = useLabBilling()

  const [selectedIpNo, setSelectedIpNo] = useState<string>(
    initialAccount ? initialAccount.ipNo : ipAccounts[0]?.ipNo || ''
  )

  const currentAccount = ipAccounts.find((a) => a.ipNo === selectedIpNo) || initialAccount

  // Add Charge Form State
  const [category, setCategory] = useState<'Room' | 'Doctor' | 'Nursing' | 'Laboratory' | 'Pharmacy' | 'Procedure' | 'Surgery' | 'Other'>('Doctor')
  const [description, setDescription] = useState('Daily Specialist Doctor Consultation')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('600')
  const [discount] = useState('0')

  const handleAddCharge = () => {
    if (!currentAccount || !description.trim()) return
    const qty = Number(quantity) || 1
    const price = Number(unitPrice) || 0
    const disc = Number(discount) || 0
    const amt = qty * price - disc

    addIPCharge(currentAccount.ipNo, {
      category,
      description,
      quantity: qty,
      unitPrice: price,
      discount: disc,
      amount: Math.max(0, amt),
    })

    setDescription('')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
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
              <Building2 className="w-6 h-6 text-[#2952CC]" />
              IP Billing Detail &amp; Charge Entry
            </h2>
            <p className="text-xs text-slate-500">View and post daily categorized charges to inpatient medical record</p>
          </div>
        </div>
      </div>

      {/* Select IP Account */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <FieldLabel required>Select Active Inpatient Account</FieldLabel>
            <SelectField
              options={ipAccounts.map((a) => a.ipNo)}
              value={selectedIpNo}
              onChange={(val) => setSelectedIpNo(val)}
              placeholder="Choose IP Number"
            />
          </div>
        </CardContent>
      </Card>

      {currentAccount ? (
        <div className="space-y-6">
          {/* Patient & Admission Info */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Inpatient Admission Demographics</span>
                <Badge variant="outline" className="font-mono text-[#2952CC]">{currentAccount.ipNo}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div><span className="text-slate-500 block">Patient ID:</span> <b>{currentAccount.patientId}</b></div>
              <div><span className="text-slate-500 block">Patient Name:</span> <b>{currentAccount.patientName}</b></div>
              <div><span className="text-slate-500 block">Ward &amp; Bed:</span> <b>{currentAccount.ward} ({currentAccount.bed})</b></div>
              <div><span className="text-slate-500 block">Attending Doctor:</span> <b>{currentAccount.doctor}</b></div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Post Charge Form */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#2952CC]" /> Post New Daily Charge / Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs">
                <div>
                  <FieldLabel required>Charge Category</FieldLabel>
                  <SelectField
                    options={['Room', 'Doctor', 'Nursing', 'Laboratory', 'Pharmacy', 'Procedure', 'Surgery', 'Other']}
                    value={category}
                    onChange={(val) => setCategory(val as any)}
                  />
                </div>

                <div>
                  <FieldLabel required>Description / Service</FieldLabel>
                  <TextField value={description} onChange={setDescription} placeholder="e.g. ICU Daily Care Charge" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Quantity</FieldLabel>
                    <TextField value={quantity} onChange={setQuantity} />
                  </div>
                  <div>
                    <FieldLabel required>Unit Price (₹)</FieldLabel>
                    <TextField value={unitPrice} onChange={setUnitPrice} />
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleAddCharge} className="w-full bg-[#2952CC] hover:bg-blue-700 text-white gap-1 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add Charge to Ledger
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Charges Ledger Table */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#2952CC]" /> Categorized Inpatient Ledger Charges
                </CardTitle>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Total Posted: <span className="text-emerald-600">₹{currentAccount.totalCharges}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5">Unit Price (₹)</th>
                        <th className="p-2.5">Discount (₹)</th>
                        <th className="p-2.5 font-bold text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentAccount.charges.map((c) => (
                        <tr key={c.id}>
                          <td className="p-2.5 text-slate-500">{c.date}</td>
                          <td className="p-2.5"><Badge variant="outline">{c.category}</Badge></td>
                          <td className="p-2.5 font-medium">{c.description}</td>
                          <td className="p-2.5 text-center">{c.quantity}</td>
                          <td className="p-2.5">₹{c.unitPrice}</td>
                          <td className="p-2.5 text-emerald-600">₹{c.discount}</td>
                          <td className="p-2.5 font-bold text-right text-slate-900 dark:text-slate-100">₹{c.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ledger Summary Footer */}
                <div className="flex justify-between items-center text-xs pt-4 border-t mt-4">
                  <div className="text-slate-500">
                    Total Items Billed: <b>{currentAccount.charges.length}</b>
                  </div>
                  <div className="space-x-6">
                    <span>Paid Deposits: <b className="text-emerald-600">₹{currentAccount.paidAmount}</b></span>
                    <span>Outstanding Balance: <b className="text-amber-600 font-bold">₹{currentAccount.outstanding}</b></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500 text-xs">
          No inpatient account selected.
        </Card>
      )}
    </div>
  )
}
