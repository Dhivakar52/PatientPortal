import React from 'react'
import { Download } from 'lucide-react'
import type { BillItemData } from '@/types/patientPortal.types'

interface BillCardProps {
  bill: BillItemData
  onDownload?: (bill: BillItemData) => void
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onDownload }) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDownload) {
      onDownload(bill)
    }
  }

  return (
    <div className="border border-[#e5e7eb] dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      {/* Light Gray Header for Bill Date */}
      <div className="bg-[#f3f4f6] dark:bg-slate-800/80 px-3.5 py-2 border-b border-[#e5e7eb] dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Bill Date {bill.date}
        </span>
      </div>

      {/* White Content Body for Bill No & Download Button */}
      <div className="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs font-normal text-slate-600 dark:text-slate-400">
            Bill No :{' '}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {bill.billNo}
          </span>
        </div>

        {/* Small Download Button aligned to the right */}
        <button
          type="button"
          onClick={handleDownloadClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors shrink-0 shadow-2xs active:scale-[0.98]"
          title={`Download Bill No ${bill.billNo}`}
        >
          <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          <span>Download</span>
        </button>
      </div>
    </div>
  )
}
