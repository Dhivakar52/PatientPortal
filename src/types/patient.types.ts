export interface Patient {
  id: string
  mobile: string
  name: string
  gender: 'Male' | 'Female' | 'Other'
  dob: string
  address: string
  city: string
  state: string
  pincode: string
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
}

export type FlowScreen = 'login' | 'register' | 'select' | 'app'
export type RegisterContext = 'newAccount' | 'addPatient'
export type ActiveTab = 'home' | 'visits' | 'lab' | 'bills' | 'book'
export type BillsSubtab = 'op' | 'ip'
