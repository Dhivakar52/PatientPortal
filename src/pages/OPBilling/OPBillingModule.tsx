import React, { useState } from 'react'
import { NewOPBillScreen } from './NewOPBillScreen'
import { OPBillHistoryScreen } from './OPBillHistoryScreen'
import { Receipt, PlusCircle, History } from 'lucide-react'

export type OPTab = 'new-bill' | 'history'

export const OPBillingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OPTab>('new-bill')

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Outpatient (OP) Billing</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate OP billing receipts, collect payments, and manage refunds</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => setActiveTab('new-bill')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'new-bill'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> New OP Bill
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" /> OP Bill History
          </button>
        </div>
      </div>

      {/* Screen Content */}
      {activeTab === 'new-bill' && <NewOPBillScreen onBillCreated={() => setActiveTab('history')} />}
      {activeTab === 'history' && <OPBillHistoryScreen />}
    </div>
  )
}
