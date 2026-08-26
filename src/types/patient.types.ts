export interface Patient {
  TotalPatients?: number
  TotalCount?: number
  PatientID: number
  PatientName: string
  UHID?: string | null
  RegisterNo?: string | null
  AbhaID?: string | null
  DOB?: string
  Age?: number
  GenderID?: number
  Gender?: string
  Address?: string
  PatientAddress?: string
  StateID?: number
  stateID?: number
  CityID?: number
  cityID?: number
  CountryID?: number
  countryID?: number
  City?: string
  State?: string
  PatientState?: string
  PinCode?: string
  PhoneNo?: string
  phoneNo?: string
  Email?: string | null
  email?: string | null
  EmailID?: string | null
  emailID?: string | null

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

export interface UserPatientResponse {
  TotalCount: number
  UserID: number
  UserTypeID?: number
  UserType?: string
  phoneNo: string
  Patients: Patient[]
}

export interface UserRecord {
  mobile: string
  patients: Patient[]
  activePatientId: string | null
}



export interface Appointment {
  AppointmentID?: number
  PatientID?: number
  PatientName?: string
  AppointmentStatus?: string
  AppointmentDate?: string
  AppointmentType?: string
  DeptID?: number
  DeptName?: string
  Department?: string
  DoctorID?: number
  DoctorName?: string
  TimeSlotID?: number
  TimeSlot?: string
  Timeslot?: string
  UnitID?: number
  Unit?: string
  StatusID?: number
  Status?: string
  AppointmentNo?: string
  BookedOn?: string

  // UI mapping fields
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
