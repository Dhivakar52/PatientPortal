export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Insurance'
export type OPBillStatus = 'Active' | 'Cancelled' | 'Refunded'
export type OPPaymentStatus = 'Unpaid' | 'Partial' | 'Paid'

export interface ServiceMasterItem {
  id: string
  code: string
  name: string
  category: 'Laboratory' | 'Consultation' | 'Pharmacy' | 'Procedure' | 'Surgery' | 'Nursing' | 'Room' | 'Other'
  unitPrice: number
  taxPercent: number
  status: 'Active' | 'Inactive'
}

export interface OPBillItem {
  id: string
  serviceCode: string
  serviceName: string
  category: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  amount: number
}

export interface OPBill {
  id: string
  billNo: string
  patientId: string
  patientName: string
  mobile: string
  visitId: string
  doctor: string
  department: string
  billDate: string
  items: OPBillItem[]
  subtotal: number
  discount: number
  tax: number
  billAmount: number
  paidAmount: number
  balance: number
  paymentStatus: OPPaymentStatus
  billStatus: OPBillStatus
  paymentMode?: PaymentMode
  remarks?: string
}

export interface OPPayment {
  id: string
  billNo: string
  patientId: string
  patientName: string
  paymentDate: string
  amount: number
  paymentMode: PaymentMode
  transactionRef: string
  remarks?: string
}

export interface OPRefund {
  id: string
  billNo: string
  patientId: string
  patientName: string
  refundDate: string
  amount: number
  refundMode: PaymentMode
  reason: string
  remarks?: string
}

export type IPAccountStatus = 'Active' | 'Interim Billed' | 'Ready for Discharge' | 'Discharged' | 'Cancelled'

export interface IPChargeItem {
  id: string
  date: string
  category: 'Room' | 'Doctor' | 'Nursing' | 'Laboratory' | 'Pharmacy' | 'Procedure' | 'Surgery' | 'Other'
  description: string
  quantity: number
  unitPrice: number
  discount: number
  amount: number
}

export interface IPAccount {
  id: string
  ipNo: string
  patientId: string
  patientName: string
  ageGender: string
  admissionDate: string
  dischargeDate?: string
  ward: string
  room: string
  bed: string
  doctor: string
  department: string
  accountStatus: IPAccountStatus
  charges: IPChargeItem[]
  totalCharges: number
  discount: number
  tax: number
  insuranceAdjustment: number
  paidAmount: number
  outstanding: number
}

export interface InterimBill {
  id: string
  billNo: string
  ipNo: string
  patientId: string
  patientName: string
  billDate: string
  previousBalance: number
  currentCharges: number
  discount: number
  payments: number
  currentOutstanding: number
  status: 'Generated' | 'Paid'
}

export interface FinalIPBill {
  id: string
  billNo: string
  ipNo: string
  patientId: string
  patientName: string
  admissionDate: string
  dischargeDate: string
  wardRoomBed: string
  doctor: string
  totalCharges: number
  discount: number
  insuranceAdjustment: number
  tax: number
  grandTotal: number
  paidAmount: number
  outstanding: number
  billDate: string
  status: 'Draft' | 'Finalized' | 'Discharged'
}
