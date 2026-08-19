import React from 'react'

export type BillingTabType = 'op' | 'ip'

interface BillingTabsProps {
  activeTab: BillingTabType
  onTabChange: (tab: BillingTabType) => void
  opCount?: number
  ipCount?: number
}

export const BillingTabs: React.FC<BillingTabsProps> = ({
  activeTab,
  onTabChange,
  opCount,
  ipCount,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        type="button"
        onClick={() => onTabChange('op')}
        className={`px-4 py-1.5 text-xs font-bold rounded border cursor-pointer transition-all duration-150 shadow-2xs ${activeTab === 'op'
          ? 'text-white border-[#14213D] dark:bg-slate-800 dark:border-slate-700'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        style={{
          backgroundColor:
            activeTab === 'op'
              ? 'var(--blue-text-color)'
              : undefined,
          color:
            activeTab === 'op'
              ? '#fff'
              : undefined,
          borderColor:
            activeTab === 'op'
              ? 'var(--blue-text-color)'
              : undefined,
        }}

      >
        <span>OP Bill</span>
        {typeof opCount === 'number' && (
          <span
            className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'op'
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
          >
            {opCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onTabChange('ip')}
        className={`px-4 py-1.5 text-xs font-bold rounded border cursor-pointer transition-all duration-150 shadow-2xs ${activeTab === 'ip'
          ? ' text-white border-[#14213D] dark:bg-slate-800 dark:border-slate-700'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        style={{
          backgroundColor:
            activeTab === 'ip'
              ? 'var(--blue-text-color)'
              : undefined,
          color:
            activeTab === 'ip'
              ? '#fff'
              : undefined,
          borderColor:
            activeTab === 'ip'
              ? 'var(--blue-text-color)'
              : undefined,
        }}
      >
        <span>IP Bill</span>
        {typeof ipCount === 'number' && (
          <span
            className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'ip'
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
          >
            {ipCount}
          </span>
        )}
      </button>
    </div >
  )
}
