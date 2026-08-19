import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { BillCard } from './BillCard'
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter bills based on search query
  const filteredBills = bills.filter(
    (b) =>
      b.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.date.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-3">
      {/* Header search bar matching Visit search */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
        </div>

        {/* Expandable Search Icon Toggle */}
        <div className="flex items-center gap-2">
          {isSearchOpen || searchQuery !== '' ? (
            <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search bill no or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchOpen(false)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5  border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Search bills"
              style={{ borderRadius: '4px' }}
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filteredBills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => (
            <BillCard key={bill.id || bill.billNo} bill={bill} onDownload={handleDownload} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-md p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {searchQuery ? 'No matching bills found' : emptyMessage}
          </p>
        </div>
      )}
    </div>
  )
}
