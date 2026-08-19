import React from 'react'
import { Download } from 'lucide-react'
import type { LabReportItem } from '@/types/patientPortal.types'

interface LabReportCardProps {
  report: LabReportItem
  onDownload?: (report: LabReportItem) => void
}

export const LabReportCard: React.FC<LabReportCardProps> = ({
  report,
  onDownload,
}) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDownload) {
      onDownload(report)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-800 rounded p-3 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left: Test Name & Department */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
          {report.name}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
          {report.department}
        </span>
      </div>

      {/* Right: Download Button */}
      <button
        type="button"
        onClick={handleDownloadClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors shrink-0 shadow-2xs active:scale-[0.98]"
        title={`Download ${report.name} Report`}
      >
        <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        <span>Download</span>
      </button>
    </div>
  )
}
