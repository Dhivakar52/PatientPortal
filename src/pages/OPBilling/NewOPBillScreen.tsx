import React, { useState } from 'react'
import { useLabBilling } from '@/context/LabBillingContext'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import type { OPBillItem, PaymentMode } from '@/types/billing.types'
import { Receipt, Plus, Trash2, CheckCircle2, UserCheck, DollarSign } from 'lucide-react'

interface NewOPBillScreenProps {
  onBillCreated?: () => void
}

export const NewOPBillScreen: React.FC<NewOPBillScreenProps> = ({ onBillCreated }) => {
  const { serviceMaster, createOPBill } = useLabBilling()

  // Sample patient list for selection
  const samplePatients = [
    { patientId: 'P-10023', patientName: 'Priya Sharma', mobile: '9876543210', visitId: 'VIS-9941', ageGender: '28 / Female', doctor: 'Dr. Anita Roy', department: 'Gynecology' },
    { patientId: 'P-10045', patientName: 'Rajesh Kumar', mobile: '9876543211', visitId: 'VIS-9942', ageGender: '45 / Male', doctor: 'Dr. Suresh Mehta', department: 'General Medicine' },
    { patientId: 'P-10088', patientName: 'Ananya Verma', mobile: '9876543212', visitId: 'VIS-9945', ageGender: '32 / Female', doctor: 'Dr. Kavita Patil', department: 'Endocrinology' },
  ]

  const [selectedPatientId, setSelectedPatientId] = useState(samplePatients[0].patientId)
  const currentPatient = samplePatients.find((p) => p.patientId === selectedPatientId) || samplePatients[0]

  // Services added to current draft bill
  const [items, setItems] = useState<OPBillItem[]>([
    { id: 'item-1', serviceCode: 'CON-GYN', serviceName: 'Gynecology Specialist Visit', category: 'Consultation', quantity: 1, unitPrice: 700, discount: 0, tax: 0, amount: 700 },
  ])

  // Service Selector dropdown state
  const [selectedServiceCode, setSelectedServiceCode] = useState('')

  // Payment state
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI')
  const [paidAmountInput, setPaidAmountInput] = useState<string>('')

  // Calculate dynamic totals
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0)
  const totalTax = items.reduce((sum, item) => sum + item.tax, 0)
  const netAmount = Math.max(0, subtotal - totalDiscount + totalTax)

  const initialPaid = paidAmountInput ? Number(paidAmountInput) : netAmount
  const balanceAmount = Math.max(0, netAmount - initialPaid)

  const handleAddService = () => {
    if (!selectedServiceCode) return
    const srv = serviceMaster.find((s) => s.code === selectedServiceCode)
    if (!srv) return

    const existing = items.find((i) => i.serviceCode === srv.code)
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.serviceCode === srv.code
            ? { ...i, quantity: i.quantity + 1, amount: (i.quantity + 1) * i.unitPrice - i.discount }
            : i
        )
      )
    } else {
      const newItem: OPBillItem = {
        id: `item-${Date.now()}`,
        serviceCode: srv.code,
        serviceName: srv.name,
        category: srv.category,
        quantity: 1,
        unitPrice: srv.unitPrice,
        discount: 0,
        tax: Math.round((srv.unitPrice * srv.taxPercent) / 100),
        amount: srv.unitPrice,
      }
      setItems((prev) => [...prev, newItem])
    }
    setSelectedServiceCode('')
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleQtyChange = (id: string, qtyStr: string) => {
    const qty = Math.max(1, Number(qtyStr) || 1)
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: qty, amount: qty * i.unitPrice - i.discount + i.tax }
          : i
      )
    )
  }

  const handleDiscountChange = (id: string, discStr: string) => {
    const disc = Math.max(0, Number(discStr) || 0)
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, discount: disc, amount: i.quantity * i.unitPrice - disc + i.tax }
          : i
      )
    )
  }

  const handleGenerateBill = () => {
    if (items.length === 0) return
    const paidVal = Math.min(netAmount, initialPaid)
    const balVal = Math.max(0, netAmount - paidVal)
    const pStatus = balVal === 0 ? 'Paid' : paidVal > 0 ? 'Partial' : 'Unpaid'

    createOPBill({
      patientId: currentPatient.patientId,
      patientName: currentPatient.patientName,
      mobile: currentPatient.mobile,
      visitId: currentPatient.visitId,
      doctor: currentPatient.doctor,
      department: currentPatient.department,
      items,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      billAmount: netAmount,
      paidAmount: paidVal,
      balance: balVal,
      paymentStatus: pStatus,
      billStatus: 'Active',
      paymentMode,
    })

    if (onBillCreated) onBillCreated()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Patient Selection & Details Header */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" /> OP Patient Selection &amp; Demographics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="max-w-md">
            <FieldLabel required>Select Registered OP Patient</FieldLabel>
            <SelectField
              options={samplePatients.map((p) => p.patientId)}
              value={selectedPatientId}
              onChange={(val) => setSelectedPatientId(val)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded bg-slate-50 dark:bg-slate-800 text-xs">
            <div><span className="text-slate-500 block">Patient Name:</span> <b>{currentPatient.patientName}</b></div>
            <div><span className="text-slate-500 block">Patient ID:</span> <b>{currentPatient.patientId}</b></div>
            <div><span className="text-slate-500 block">Mobile:</span> <b>{currentPatient.mobile}</b></div>
            <div><span className="text-slate-500 block">Visit ID:</span> <b>{currentPatient.visitId}</b></div>
            <div><span className="text-slate-500 block">Age / Gender:</span> <b>{currentPatient.ageGender}</b></div>
            <div><span className="text-slate-500 block">Attending Doctor:</span> <b>{currentPatient.doctor}</b></div>
            <div><span className="text-slate-500 block">Department:</span> <b>{currentPatient.department}</b></div>
            <div><span className="text-slate-500 block">Visit Status:</span> <Badge variant="outline">Active OP</Badge></div>
          </div>
        </CardContent>
      </Card>

      {/* Services Requisition & Services Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" /> Add Billable Services &amp; Lab Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Service Selector Dropdown */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FieldLabel>Select Service from Master Catalogue</FieldLabel>
                  <SelectField
                    options={serviceMaster.map((s) => `${s.code} - ${s.name} (₹${s.unitPrice})`)}
                    value={selectedServiceCode ? `${selectedServiceCode}` : ''}
                    onChange={(val) => {
                      const code = val.split(' - ')[0]
                      setSelectedServiceCode(code)
                    }}
                    placeholder="Choose Service / Lab Test"
                  />
                </div>
                <Button onClick={handleAddService} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Service Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 w-16">Qty</th>
                      <th className="p-2.5">Price (₹)</th>
                      <th className="p-2.5 w-20">Disc (₹)</th>
                      <th className="p-2.5">Amount (₹)</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-mono font-semibold text-blue-600">{item.serviceCode}</td>
                        <td className="p-2.5 font-medium">{item.serviceName}</td>
                        <td className="p-2.5"><Badge variant="outline">{item.category}</Badge></td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            className="w-12 border rounded px-1.5 py-1 text-center font-bold text-xs"
                          />
                        </td>
                        <td className="p-2.5">₹{item.unitPrice}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={(e) => handleDiscountChange(item.id, e.target.value)}
                            className="w-16 border rounded px-1.5 py-1 text-right text-xs"
                          />
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">₹{item.amount}</td>
                        <td className="p-2.5 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-700"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400">No items added to bill.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OP Bill Summary & Payment Settlement */}
        <div className="space-y-4">
          <Card className="border-blue-200 dark:border-blue-900 shadow-md">
            <CardHeader className="pb-3 border-b bg-blue-50/50 dark:bg-blue-950/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-950 dark:text-blue-200">
                <DollarSign className="w-4 h-4 text-blue-600" /> Dynamic Bill Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Charges:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Discount:</span>
                <span className="font-semibold text-emerald-600">- ₹{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 border-b pb-2">
                <span>Tax / GST:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+ ₹{totalTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-blue-900 dark:text-blue-300 pt-1">
                <span>Net Payable Amount:</span>
                <span>₹{netAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t space-y-3">
                <div>
                  <FieldLabel required>Payment Mode</FieldLabel>
                  <SelectField
                    options={['Cash', 'Card', 'UPI', 'Bank Transfer', 'Insurance']}
                    value={paymentMode}
                    onChange={(val) => setPaymentMode(val as PaymentMode)}
                  />
                </div>

                <div>
                  <FieldLabel>Amount Paid Now (₹)</FieldLabel>
                  <TextField
                    value={paidAmountInput || String(netAmount)}
                    onChange={(val) => setPaidAmountInput(val)}
                    placeholder={String(netAmount)}
                  />
                </div>

                <div className="flex justify-between text-xs font-semibold pt-1">
                  <span className="text-slate-500">Remaining Balance:</span>
                  <span className={balanceAmount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    ₹{balanceAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                disabled={items.length === 0}
                onClick={handleGenerateBill}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save &amp; Generate OP Receipt
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
