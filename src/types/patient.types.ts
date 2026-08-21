export interface Patient {
  TotalCount?: number
  PatientID: number
  PatientName: string
  UHID: string | null
  RegisterNo: string | null
  AbhaID: string | null
  DOB: string
  Age: number
  GenderID: number
  Gender: string
  PatientAddress: string
  City: string
  PatientState: string
  PinCode: string
  PhoneNo: string

  // Convenience aliases for existing components
  id?: string
  mobile?: string
  name?: string
  gender?: string
  dob?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export interface UserRecord {
  mobile: string
  patients: Patient[]
  activePatientId: string | null
}



export interface Appointment {
  apptNo: string
  date: string
  doctor: string
  department: string
  slot: string
  unit: string
  bookedOn: string
  room: string
  status?: string
}

export type FlowScreen = 'login' | 'register' | 'select' | 'app'
export type RegisterContext = 'newAccount' | 'addPatient'
export type ActiveTab = 'home' | 'visits' | 'lab' | 'bills' | 'book'
export type BillsSubtab = 'op' | 'ip'
