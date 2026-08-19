import React from 'react'
import { BillList, MOCK_IP_BILLS } from '@/pages/Patient/LaboratoryCard'

export const IPBills: React.FC = () => {
  return <BillList bills={MOCK_IP_BILLS} emptyMessage="No IP Bills found" />
}
