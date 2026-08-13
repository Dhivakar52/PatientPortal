import React, { useState } from 'react'
import { type BillsSubtab } from '@/types/patient.types'
import { OPBills } from './OPBills'
import { IPBills } from './IPBills'

export const BillsTab: React.FC = () => {
  const [subtab, setSubtab] = useState<BillsSubtab>('op')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSubtab('op')}
          className={`px-4 py-1.5 text-xs font-bold rounded border cursor-pointer ${subtab === 'op'
            ? 'bg-[#14213D] text-white border-[#14213D]'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
        >
          OP
        </button>
        <button
          onClick={() => setSubtab('ip')}
          className={`px-4 py-1.5 text-xs font-bold rounded border cursor-pointer ${subtab === 'ip'
            ? 'bg-[#14213D] text-white border-[#14213D]'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
        >
          IP
        </button>
      </div>

      {subtab === 'op' ? <OPBills /> : <IPBills />}
    </div>
  )
}
