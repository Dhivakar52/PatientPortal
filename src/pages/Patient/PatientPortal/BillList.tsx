import React from 'react'
import { BillCard } from '@/pages/Patient/LaboratoryCard/BillCard'
import type { BillItemData } from '@/types/patientPortal.types'
import { toast } from 'sonner'

interface BillListProps {
  bills: BillItemData[]
  onDownloadBill?: (bill: BillItemData) => void
  emptyMessage?: string
}

export const BillList: React.FC<BillListProps> = ({
  bills,
  onDownloadBill,
  emptyMessage = 'No bills found',
}) => {
  const handleDownload = (bill: BillItemData) => {
    if (onDownloadBill) {
      onDownloadBill(bill)
      return
    }

    // Default download logic
    toast.success(`Downloading ${bill.type.toUpperCase()} Bill No: ${bill.billNo}`)

    const element = document.createElement('a')
    const file = new Blob(
      [
        `HOSPITAL PATIENT BILL\n` +
        `Type: ${bill.type.toUpperCase()} Bill\n` +
        `Bill Date: ${bill.date}\n` +
        `Bill No: ${bill.billNo}\n` +
        `${bill.amount ? `Amount: ₹${bill.amount}\n` : ''}` +
        `Status: Paid\n` +
        `Generated On: ${new Date().toLocaleString()}\n`
      ],
      { type: 'text/plain' }
    )
    element.href = URL.createObjectURL(file)
    element.download = `${bill.type.toUpperCase()}_Bill_${bill.billNo}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!bills || bills.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-md p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bills.map((bill) => (
        <BillCard key={bill.id || bill.billNo} bill={bill} onDownload={handleDownload} />
      ))}
    </div>
  )
}
