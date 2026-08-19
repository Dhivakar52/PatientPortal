import React, { useState } from 'react'
import { FlaskConical, Search, X } from 'lucide-react'
import { LabReportCard } from './LabReportCard'
import { MOCK_LAB_REPORTS } from '@/data/patientPortalData'
import type { LabReportGroup, LabReportItem } from '@/types/patientPortal.types'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface LabReportsProps {
  data?: LabReportGroup[]
  onDownloadReport?: (report: LabReportItem, date: string) => void
  title?: string
}

export const LabReports: React.FC<LabReportsProps> = ({
  data = MOCK_LAB_REPORTS,
  onDownloadReport,
  title = 'Lab',
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDownload = (report: LabReportItem, groupDate: string) => {
    if (onDownloadReport) {
      onDownloadReport(report, groupDate)
      return
    }

    // Default download logic
    toast.success(`Downloading ${report.name} (${report.department}) report from ${groupDate}`)

    // Simulate blob download
    const element = document.createElement('a')
    const file = new Blob(
      [
        `PATIENT PORTAL LAB REPORT\n` +
        `Date: ${groupDate}\n` +
        `Test Name: ${report.name}\n` +
        `Department: ${report.department}\n` +
        `Status: Verified\n` +
        `Generated On: ${new Date().toLocaleString()}\n`
      ],
      { type: 'text/plain' }
    )
    element.href = URL.createObjectURL(file)
    element.download = `LabReport_${report.name.replace(/\s+/g, '_')}_${groupDate}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Filter reports based on search query
  const filteredGroups = data
    .map((group) => ({
      ...group,
      reports: group.reports.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.date.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.reports.length > 0)

  return (
    <div className="w-full space-y-4">
      {/* Header bar with title and expandable search icon matching Visit search */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            {title}
          </h2>
        </div>

        {/* Expandable Search Icon Toggle */}
        <div className="flex items-center gap-2">
          {isSearchOpen || searchQuery !== '' ? (
            <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search lab reports..."
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
              title="Search lab reports"
              style={{ borderRadius: '4px' }}
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Date-grouped lab reports with Accordion (only 1 open at a time) */}
      {filteredGroups.length > 0 ? (
        <Accordion
          {...({ type: "single", collapsible: true } as any)}
          className="space-y-3"
          defaultValue={filteredGroups[0]?.date}
        >
          {filteredGroups.map((group) => (
            <AccordionItem
              key={group.date}
              value={group.date}
              className="border border-[#e5e7eb] dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"
            >
              <AccordionTrigger className="px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-slate-800/80 border-b border-[#e5e7eb] dark:border-slate-800 rounded-none text-white hover:no-underline transition-colors">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {group.date}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {group.reports.length} {group.reports.length === 1 ? 'Report' : 'Reports'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-3 bg-white dark:bg-slate-900 border-t border-[#e5e7eb] dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2.5">
                  {group.reports.map((report) => (
                    <LabReportCard
                      key={report.id || `${group.date}-${report.name}-${report.department}`}
                      report={report}
                      onDownload={(rep) => handleDownload(rep, group.date)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-md p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No lab reports found
          </p>
        </div>
      )}
    </div>
  )
}