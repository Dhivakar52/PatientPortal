import React, { useState } from 'react'
import { InpatientAccountsScreen } from './InpatientAccountsScreen'
import { IPBillingDetailScreen } from './IPBillingDetailScreen'
import { InterimBillScreen } from './InterimBillScreen'
import { FinalIPBillScreen } from './FinalIPBillScreen'
import type { IPAccount } from '@/types/billing.types'
import { Building2, Users, FileText, CheckCircle2 } from 'lucide-react'

export type IPTab = 'accounts' | 'detail' | 'interim' | 'final'

export const IPBillingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<IPTab>('accounts')
  const [selectedIpAccount, setSelectedIpAccount] = useState<IPAccount | null>(null)

  const handleNavigateToDetail = (account: IPAccount) => {
    setSelectedIpAccount(account)
    setActiveTab('detail')
  }

  const handleNavigateToInterim = (account: IPAccount) => {
    setSelectedIpAccount(account)
    setActiveTab('interim')
  }

  const handleNavigateToFinal = (account: IPAccount) => {
    setSelectedIpAccount(account)
    setActiveTab('final')
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#2952CC] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Inpatient (IP) Billing System</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inpatient ledgers, daily charge postings, interim statements, and discharge bills</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-white dark:bg-slate-900 text-[#2952CC] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Inpatient Accounts
          </button>

          <button
            onClick={() => setActiveTab('detail')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'detail'
                ? 'bg-white dark:bg-slate-900 text-[#2952CC] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Billing Detail &amp; Charges
          </button>

          <button
            onClick={() => setActiveTab('interim')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'interim'
                ? 'bg-white dark:bg-slate-900 text-[#2952CC] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Interim Bill
          </button>

          <button
            onClick={() => setActiveTab('final')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'final'
                ? 'bg-white dark:bg-slate-900 text-[#2952CC] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Final IP Bill
          </button>
        </div>
      </div>

      {/* Screen Content */}
      {activeTab === 'accounts' && (
        <InpatientAccountsScreen
          onNavigateToDetail={handleNavigateToDetail}
          onNavigateToInterim={handleNavigateToInterim}
          onNavigateToFinal={handleNavigateToFinal}
        />
      )}
      {activeTab === 'detail' && (
        <IPBillingDetailScreen
          initialAccount={selectedIpAccount}
          onBack={() => setActiveTab('accounts')}
        />
      )}
      {activeTab === 'interim' && (
        <InterimBillScreen
          initialAccount={selectedIpAccount}
          onBack={() => setActiveTab('accounts')}
        />
      )}
      {activeTab === 'final' && (
        <FinalIPBillScreen
          initialAccount={selectedIpAccount}
          onBack={() => setActiveTab('accounts')}
        />
      )}
    </div>
  )
}
