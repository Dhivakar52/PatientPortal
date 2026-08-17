import React, { useState } from 'react'
import { LabOrdersScreen } from './LabOrdersScreen'
import { SampleCollectionScreen } from './SampleCollectionScreen'
import { ResultEntryScreen } from './ResultEntryScreen'
import { ResultVerificationScreen } from './ResultVerificationScreen'
import { LabReportsScreen } from './LabReportsScreen'
import { TestMasterScreen } from './TestMasterScreen'
import type { LabOrder } from '@/types/lab.types'
import { FlaskConical, TestTube, FileText, ShieldCheck, FileCheck2, Database } from 'lucide-react'

export type LabTab = 'orders' | 'collection' | 'result-entry' | 'verification' | 'reports' | 'test-master'

export const LaboratoryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LabTab>('orders')
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<LabOrder | null>(null)

  const handleNavigateToSample = (order: LabOrder) => {
    setSelectedOrderForAction(order)
    setActiveTab('collection')
  }

  const handleNavigateToResult = (order: LabOrder) => {
    setSelectedOrderForAction(order)
    setActiveTab('result-entry')
  }

  return (
    <div className="space-y-4">
      {/* Top Module Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Laboratory Information System</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete specimen tracking, lab result verification, and report management</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" /> Lab Orders
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'collection'
                ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TestTube className="w-3.5 h-3.5" /> Sample Collection
          </button>

          <button
            onClick={() => setActiveTab('result-entry')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'result-entry'
                ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Result Entry
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verification
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" /> Lab Reports
          </button>

          <button
            onClick={() => setActiveTab('test-master')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'test-master'
                ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Test Master
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <LabOrdersScreen
          onNavigateToSample={handleNavigateToSample}
          onNavigateToResult={handleNavigateToResult}
        />
      )}
      {activeTab === 'collection' && (
        <SampleCollectionScreen
          initialOrder={selectedOrderForAction}
          onBack={() => setActiveTab('orders')}
        />
      )}
      {activeTab === 'result-entry' && (
        <ResultEntryScreen
          initialOrder={selectedOrderForAction}
          onBack={() => setActiveTab('orders')}
        />
      )}
      {activeTab === 'verification' && <ResultVerificationScreen />}
      {activeTab === 'reports' && <LabReportsScreen />}
      {activeTab === 'test-master' && <TestMasterScreen />}
    </div>
  )
}
