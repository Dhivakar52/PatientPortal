export type Priority = 'Routine' | 'Urgent' | 'STAT' | 'Emergency'
export type SampleStatus = 'Pending Collection' | 'Collected' | 'In Lab' | 'Rejected'
export type ResultStatus = 'Pending Entry' | 'Draft' | 'Submitted' | 'Verified' | 'Rejected'
export type BillingStatus = 'Pending' | 'Billed' | 'Paid' | 'Cancelled'
export type ResultFlag = 'Normal' | 'High' | 'Low' | 'Critical'

export interface TestMasterItem {
  id: string
  code: string
  name: string
  category: string
  sampleType: string
  unit: string
  referenceRange: string
  price: number
  turnaroundTime: string // e.g. "2 hours", "24 hours"
  status: 'Active' | 'Inactive'
}

export interface LabResultParameter {
  id: string
  parameter: string
  result: string
  unit: string
  referenceRange: string
  flag: ResultFlag
  remarks?: string
}

export interface LabOrder {
  id: string
  orderId: string
  patientId: string
  patientName: string
  ageGender: string
  visitType: 'OP' | 'IP'
  visitId: string
  doctor: string
  department: string
  tests: string[]
  priority: Priority
  orderDate: string
  sampleStatus: SampleStatus
  resultStatus: ResultStatus
  billingStatus: BillingStatus
  sampleId?: string
  container?: string
  sampleType?: string
  collectionDate?: string
  collectionTime?: string
  collectedBy?: string
  parameters?: LabResultParameter[]
  technician?: string
  submittedDate?: string
  verifiedBy?: string
  verifiedDate?: string
  rejectionReason?: string
  opIpNumber?: string
  mobile?: string
}
