import React, { useState } from 'react'
import type { BillsSubtab } from '@/types/patient.types'
import { BillingTabs, MOCK_OP_BILLS, MOCK_IP_BILLS } from '@/pages/Patient/LaboratoryCard'
import { OPBills } from './OPBills'
import { IPBills } from './IPBills'

export const BillsTab: React.FC = () => {
  const [subtab, setSubtab] = useState<BillsSubtab>('op')

  return (
    <div className="space-y-4">
      <BillingTabs
        activeTab={subtab}
        onTabChange={(tab) => setSubtab(tab)}
        opCount={MOCK_OP_BILLS.length}
        ipCount={MOCK_IP_BILLS.length}
      />

      {subtab === 'op' ? <OPBills /> : <IPBills />}
    </div>
  )
}
