import type { LabReportGroup, BillItemData } from '@/types/patientPortal.types'

// Mock Lab Reports grouped by Date as requested
export const MOCK_LAB_REPORTS: LabReportGroup[] = [
  {
    date: '15-Jun-2026',
    reports: [
      {
        id: 'lab-15-1',
        name: 'Array',
        department: 'Biochemistry',
      },
      {
        id: 'lab-15-2',
        name: 'Array',
        department: 'Hematology',
      },
    ],
  },
  {
    date: '10-May-2026',
    reports: [
      {
        id: 'lab-10-1',
        name: 'Complete Blood Count (CBC)',
        department: 'Hematology',
      },
      {
        id: 'lab-10-2',
        name: 'Liver Function Test (LFT)',
        department: 'Biochemistry',
      },
      {
        id: 'lab-10-3',
        name: 'Lipid Profile',
        department: 'Biochemistry',
      },
      {
        id: 'lab-10-1',
        name: 'Complete Blood Count (CBC)',
        department: 'Hematology',
      },
      {
        id: 'lab-10-2',
        name: 'Liver Function Test (LFT)',
        department: 'Biochemistry',
      },
      {
        id: 'lab-10-3',
        name: 'Lipid Profile',
        department: 'Biochemistry',
      },
    ],
  },
  {
    date: '18-Apr-2026',
    reports: [
      {
        id: 'lab-18-1',
        name: 'Thyroid Stimulating Hormone (TSH)',
        department: 'Endocrinology',
      },
      {
        id: 'lab-18-2',
        name: 'Urine Routine & Microscopy',
        department: 'Pathology',
      },
    ],
  },
]

// Mock OP Bills matching specified dates and bill numbers
export const MOCK_OP_BILLS: BillItemData[] = [
  {
    id: 'op-1',
    date: '06-Jul-2026',
    billNo: '9027010047182',
    type: 'op',
    amount: 1100,
  },
  {
    id: 'op-2',
    date: '17-Jun-2026',
    billNo: '9027010038166',
    type: 'op',
    amount: 850,
  },
  {
    id: 'op-3',
    date: '15-Jun-2026',
    billNo: '9027010036709',
    type: 'op',
    amount: 1250,
  },
  {
    id: 'op-4',
    date: '01-Jun-2026',
    billNo: '9027010029584',
    type: 'op',
    amount: 450,
  },
  {
    id: 'op-5',
    date: '18-May-2026',
    billNo: '9027010014210',
    type: 'op',
    amount: 700,
  },
]

// Mock IP Bills matching IP format and structure
export const MOCK_IP_BILLS: BillItemData[] = [
  {
    id: 'ip-1',
    date: '16-Aug-2026',
    billNo: '9027010051204',
    type: 'ip',
    amount: 9550,
  },
  {
    id: 'ip-2',
    date: '24-Jul-2026',
    billNo: '9027010049921',
    type: 'ip',
    amount: 14200,
  },
  {
    id: 'ip-3',
    date: '02-Jun-2026',
    billNo: '9027010031105',
    type: 'ip',
    amount: 6800,
  },
  {
    id: 'ip-4',
    date: '14-May-2026',
    billNo: '9027010019842',
    type: 'ip',
    amount: 22400,
  },
]
