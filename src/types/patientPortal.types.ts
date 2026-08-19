export interface LabReportItem {
  id: string
  name: string
  department: string
  downloadUrl?: string
  status?: string
}

export interface LabReportGroup {
  date: string
  reports: LabReportItem[]
}

export interface BillItemData {
  id: string
  date: string
  billNo: string
  type: 'op' | 'ip'
  amount?: number
  downloadUrl?: string
}
