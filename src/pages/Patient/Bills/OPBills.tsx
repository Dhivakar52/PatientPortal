import React from 'react'
import { BillList, MOCK_OP_BILLS } from '@/pages/Patient/LaboratoryCard'

export const OPBills: React.FC = () => {
  return <BillList bills={MOCK_OP_BILLS} emptyMessage="No OP Bills found" />
}
