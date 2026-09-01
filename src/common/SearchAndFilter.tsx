import React, { useState, useMemo, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import CustomPanel from '@/common/CustomPanel'
import { DateField } from '@/components/FormPrimitives'
import { NativeSelect } from '@/components/ui/native-select'
import { todayStr } from '@/utils/patient.utils'
import { type Appointment } from '@/types/patient.types'

// Helper to parse date strings safely
export const parseStandardDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null
  const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
    return isNaN(d.getTime()) ? null : d
  }
  const ddMmMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (ddMmMatch) {
    const d = new Date(Number(ddMmMatch[3]), Number(ddMmMatch[2]) - 1, Number(ddMmMatch[1]))
    return isNaN(d.getTime()) ? null : d
  }
  const monMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  }
  const monMatch = dateStr.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{2,4})/)
  if (monMatch) {
    const day = Number(monMatch[1])
    const mon = monMap[monMatch[2].toLowerCase()]
    let yr = Number(monMatch[3])
    if (yr < 100) yr += 2000
    if (mon !== undefined) {
      const d = new Date(yr, mon, day)
      return isNaN(d.getTime()) ? null : d
    }
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

export interface UseSearchAndFilterOptions<T = Appointment> {
  initialSearch?: string
  initialStatus?: string
  initialFromDate?: Date
  initialToDate?: Date
  onFilterChange?: () => void
  customFilterFn?: (item: T, state: SearchAndFilterState) => boolean
}

export interface SearchAndFilterState {
  searchTerm: string
  statusFilter: string
  fromDate: Date | undefined
  toDate: Date | undefined
  isFiltered: boolean
}

export interface UseSearchAndFilterReturn<T = Appointment> {
  // Active State
  searchTerm: string
  setSearchTerm: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  fromDate: Date | undefined
  setFromDate: (v: Date | undefined) => void
  toDate: Date | undefined
  setToDate: (v: Date | undefined) => void
  isFiltered: boolean

  // Drawer / UI State
  isFilterPanelOpen: boolean
  setIsFilterPanelOpen: (v: boolean) => void
  isSearchOpen: boolean
  setIsSearchOpen: (v: boolean) => void
  tempFromDate: Date | undefined
  setTempFromDate: (v: Date | undefined) => void
  tempToDate: Date | undefined
  setTempToDate: (v: Date | undefined) => void
  tempStatusFilter: string
  setTempStatusFilter: (v: string) => void

  // Actions
  handleOpenFilterPanel: () => void
  handleApplyFilter: () => void
  clearFilters: () => void

  // Filtering Utility
  filterItems: (items: T[]) => T[]
}

/**
 * Custom Hook: useSearchAndFilter
 * Reusable filter & search state manager
 */
export function useSearchAndFilter<T extends Record<string, any> = Appointment>(
  options?: UseSearchAndFilterOptions<T>
): UseSearchAndFilterReturn<T> {
  const [searchTerm, setSearchTerm] = useState(options?.initialSearch || '')
  const [statusFilter, setStatusFilter] = useState(options?.initialStatus || 'all')
  const [fromDate, setFromDate] = useState<Date | undefined>(options?.initialFromDate)
  const [toDate, setToDate] = useState<Date | undefined>(options?.initialToDate)

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>()
  const [tempToDate, setTempToDate] = useState<Date | undefined>()
  const [tempStatusFilter, setTempStatusFilter] = useState<string>('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const isFiltered = useMemo(() => {
    return searchTerm.trim() !== '' || statusFilter !== 'all' || fromDate !== undefined || toDate !== undefined
  }, [searchTerm, statusFilter, fromDate, toDate])

  const handleOpenFilterPanel = useCallback(() => {
    setTempFromDate(fromDate)
    setTempToDate(toDate)
    setTempStatusFilter(statusFilter)
    setIsFilterPanelOpen(true)
  }, [fromDate, toDate, statusFilter])

  const handleApplyFilter = useCallback(() => {
    setFromDate(tempFromDate)
    setToDate(tempToDate)
    setStatusFilter(tempStatusFilter)
    setIsFilterPanelOpen(false)
    options?.onFilterChange?.()
  }, [tempFromDate, tempToDate, tempStatusFilter, options])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('all')
    setFromDate(undefined)
    setToDate(undefined)
    setTempFromDate(undefined)
    setTempToDate(undefined)
    setTempStatusFilter('all')
    setIsFilterPanelOpen(false)
    setIsSearchOpen(false)
    options?.onFilterChange?.()
  }, [options])

  const today = todayStr()

  const filterItems = useCallback((items: T[]): T[] => {
    if (!Array.isArray(items)) return []

    return items.filter((item) => {
      if (options?.customFilterFn) {
        return options.customFilterFn(item, {
          searchTerm,
          statusFilter,
          fromDate,
          toDate,
          isFiltered,
        })
      }

      // Default Appointment filtering
      const appt = item as unknown as Appointment

      // Status filter
      if (statusFilter !== 'all') {
        const rawStatus = (
          appt.AppointmentStatus ||
          appt.status ||
          appt.Status ||
          (appt as any).AppointmentStatus ||
          (appt as any).status ||
          ''
        ).toLowerCase()

        const computedStatus = rawStatus ? rawStatus : (appt.date < today ? 'completed' : '')

        if (statusFilter === 'visited') {
          if (computedStatus !== 'visited' && computedStatus !== 'completed') return false
        } else if (statusFilter === 'not visited') {
          if (computedStatus === 'visited' || computedStatus === 'completed' || computedStatus === 'cancelled') return false
        } else if (statusFilter === 'cancelled') {
          if (computedStatus !== 'cancelled') return false
        }
      }

      // Date Range Filter
      const apptDateObj = parseStandardDate(appt.date || appt.AppointmentDate || '')
      if (apptDateObj) {
        if (fromDate) {
          const fromObj = new Date(fromDate)
          fromObj.setHours(0, 0, 0, 0)
          if (apptDateObj < fromObj) return false
        }
        if (toDate) {
          const toObj = new Date(toDate)
          toObj.setHours(23, 59, 59, 999)
          if (apptDateObj > toObj) return false
        }
      }

      // Search Query
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim()
        const doctor = (appt.doctor || appt.DoctorName || '').toLowerCase()
        const dept = (appt.department || appt.DeptName || appt.Department || '').toLowerCase()
        const apptNo = (appt.apptNo || appt.AppointmentNo || '').toLowerCase()
        const unit = (appt.unit || appt.Unit || '').toLowerCase()
        const patientName = (appt.PatientName || (appt as any).patientName || '').toLowerCase()

        return doctor.includes(q) || dept.includes(q) || apptNo.includes(q) || unit.includes(q) || patientName.includes(q)
      }

      return true
    })
  }, [options, searchTerm, statusFilter, fromDate, toDate, isFiltered, today])

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    isFiltered,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    isSearchOpen,
    setIsSearchOpen,
    tempFromDate,
    setTempFromDate,
    tempToDate,
    setTempToDate,
    tempStatusFilter,
    setTempStatusFilter,
    handleOpenFilterPanel,
    handleApplyFilter,
    clearFilters,
    filterItems,
  }
}

/* ==========================================================================
   UI COMPONENTS
   ========================================================================== */

export interface SearchAndFilterControlsProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  onOpenFilterPanel: () => void
  isFiltered: boolean
  isFilterPanelOpen?: boolean
  searchPlaceholder?: string
  searchTitle?: string
  filterTitle?: string
}

/**
 * Reusable Right-side Header Controls: Search input/toggle + Filter button with active dot
 */
export const SearchAndFilterControls: React.FC<SearchAndFilterControlsProps> = ({
  searchTerm,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
  onOpenFilterPanel,
  isFiltered,
  isFilterPanelOpen = false,
  searchPlaceholder = 'Search by doctor, dept, ID...',
  searchTitle = 'Search',
  filterTitle = 'Filter',
}) => {
  return (
    <div className="flex items-center gap-2 relative">
      {/* Search Toggle / Input */}
      {isSearchOpen || searchTerm !== '' ? (
        <div className="relative flex items-center w-[120px] animate-in fade-in duration-200">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <button
            type="button"
            onClick={() => {
              onSearchChange('')
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
          className="p-1.5 border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
          title={searchTitle}
          style={{ borderRadius: '4px' }}
        >
          <Search className="w-4 h-4" />
        </button>
      )}

      {/* Filter Button */}
      <button
        type="button"
        onClick={onOpenFilterPanel}
        className={`p-1.5 border transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-2xs ${isFilterPanelOpen || isFiltered
          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        style={{ borderRadius: '4px' }}
        title={filterTitle}
      >
        <Filter className="w-4 h-4" />
        {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
      </button>
    </div>
  )
}

export interface FilterSummaryProps {
  isFiltered: boolean
  filteredCount: number
  totalCount: number
  unitName?: string
  onClearFilters?: () => void
  showClearButton?: boolean
}

/**
 * Sub-counter bar displayed when filters are active
 */
export const FilterSummary: React.FC<FilterSummaryProps> = ({
  isFiltered,
  filteredCount,
  totalCount,
  unitName = 'record',
  onClearFilters,
  showClearButton = true,
}) => {
  if (!isFiltered) return null

  const unitPlural = filteredCount === 1 ? unitName : `${unitName}s`

  return (
    <div className="text-xs text-slate-500 dark:text-slate-400 px-1 flex items-center justify-between animate-in fade-in-50">
      <span>
        Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredCount}</span> {unitPlural} (filtered from {totalCount} total)
      </span>
      {showClearButton && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Clear Filter
        </button>
      )}
    </div>
  )
}

export interface FilterDrawerOption {
  value: string
  label: string
}

export interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  title?: string
  saveLabel?: string
  width?: string

  // Date Range Controls
  showDateRange?: boolean
  dateRangeLabel?: string
  tempFromDate?: Date | undefined
  setTempFromDate?: (d: Date | undefined) => void
  tempToDate?: Date | undefined
  setTempToDate?: (d: Date | undefined) => void

  // Status Filter Controls
  showStatusFilter?: boolean
  statusLabel?: string
  tempStatusFilter?: string
  setTempStatusFilter?: (s: string) => void
  statusOptions?: FilterDrawerOption[]

  // Reset
  onResetSelections?: () => void
  children?: React.ReactNode
}

/**
 * Reusable Filter Drawer Component (using CustomPanel)
 */
export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  title = 'Filter Records',
  saveLabel = 'Apply Filter',
  width = '420px',
  showDateRange = true,
  dateRangeLabel = 'Date Range',
  tempFromDate,
  setTempFromDate,
  tempToDate,
  setTempToDate,
  showStatusFilter = false,
  statusLabel = 'Status',
  tempStatusFilter = 'all',
  setTempStatusFilter,
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'visited', label: 'Visited' },
    { value: 'not visited', label: 'Not Visited' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  onResetSelections,
  children,
}) => {
  const hasActiveSelections =
    tempFromDate !== undefined || tempToDate !== undefined || (showStatusFilter && tempStatusFilter !== 'all')

  const handleReset = () => {
    if (onResetSelections) {
      onResetSelections()
    } else {
      setTempFromDate?.(undefined)
      setTempToDate?.(undefined)
      setTempStatusFilter?.('all')
    }
  }

  return (
    <CustomPanel
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      onSave={onApply}
      saveLabel={saveLabel}
      width={width}
    >
      <div className="space-y-5">
        {/* 1. Date Range Filter */}
        {showDateRange && setTempFromDate && setTempToDate && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {dateRangeLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  From Date
                </label>
                <DateField
                  value={tempFromDate}
                  onChange={setTempFromDate}
                  placeholder="Select From Date"
                  defaultLabel="Select From Date"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  To Date
                </label>
                <DateField
                  value={tempToDate}
                  onChange={setTempToDate}
                  placeholder="Select To Date"
                  defaultLabel="Select To Date"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Status Filter */}
        {showStatusFilter && setTempStatusFilter && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {statusLabel}
            </label>
            <NativeSelect
              value={tempStatusFilter}
              onChange={(e) => setTempStatusFilter(e.target.value)}
              size="sm"
              className="w-full text-xs"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        {/* 3. Custom Children Content */}
        {children}

        {/* 4. Reset Action */}
        {hasActiveSelections && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Reset Filter Selections
            </button>
          </div>
        )}
      </div>
    </CustomPanel>
  )
}

export default {
  useSearchAndFilter,
  SearchAndFilterControls,
  FilterSummary,
  FilterDrawer,
}
