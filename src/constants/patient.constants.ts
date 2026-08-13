import { type UserRecord, type Appointment } from '../types/patient.types'

export const DOCTORS = ['Dr. Madhumitha', 'Dr. Ravi', 'Dr. Ganesh', 'Dr. Anu']
export const HOSPITAL_NAME = 'SRM Medical College Hospital and Research Centre'

export const UNIT_SLOTS: Record<string, string[]> = {
  'Unit 1': [
    '08:00-08:10',
    '08:10-08:20',
    '08:20-08:30',
    '08:30-08:40',
    '08:40-08:50',
    '08:50-09:00',
    '09:00-09:10',
    '09:10-09:20',
    '09:20-09:30',
  ],
  'Unit 2': [
    '09:00-09:10',
    '09:10-09:20',
    '09:20-09:30',
    '09:30-09:40',
    '09:40-09:50',
    '09:50-10:00',
    '10:00-10:10',
    '10:10-10:20',
    '10:20-10:30',
  ],
  'Unit 3': [
    '10:00-10:10',
    '10:10-10:20',
    '10:20-10:30',
    '10:30-10:40',
    '10:40-10:50',
    '10:50-11:00',
    '11:00-11:10',
    '11:10-11:20',
    '11:20-11:30',
  ],
  'Unit 4': [
    '11:00-11:10',
    '11:10-11:20',
    '11:20-11:30',
    '11:30-11:40',
    '11:40-11:50',
    '11:50-12:00',
    '12:00-12:10',
    '12:10-12:20',
    '12:20-12:30',
  ],
}

export const UNIT_BOOKED: Record<string, string[]> = {
  'Unit 1': ['08:10-08:20', '08:40-08:50'],
  'Unit 2': ['09:20-09:30', '10:00-10:10', '10:10-10:20'],
  'Unit 3': ['10:30-10:40'],
  'Unit 4': ['11:10-11:20', '11:40-11:50', '12:10-12:20'],
}

export const INITIAL_USERS: Record<string, UserRecord> = {
  '9876543210': {
    mobile: '9876543210',
    patients: [
      {
        id: 'p1',
        mobile: '9876543210',
        name: 'Priya Kumar',
        gender: 'Female',
        dob: '1994-05-15',
        address: '123 SRM Avenue',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '603203',
      },
      {
        id: 'p2',
        mobile: '9876543210',
        name: 'Rajesh Kumar',
        gender: 'Male',
        dob: '1990-08-20',
        address: '123 SRM Avenue',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '603203',
      },
    ],
    activePatientId: 'p1',
  },
}

export const INITIAL_APPOINTMENTS: Record<string, Appointment[]> = {
  p1: [
    {
      apptNo: 'APT-20260815-482910',
      date: '2026-08-20',
      doctor: 'Dr. Madhumitha',
      department: 'Gynecology',
      slot: '09:00-09:10',
      unit: 'Unit 2',
      bookedOn: new Date().toISOString(),
      room: 'GYN-201',
    },
    {
      apptNo: 'APT-20260710-119284',
      date: '2026-07-10',
      doctor: 'Dr. Ravi',
      department: 'Gynecology',
      slot: '10:10-10:20',
      unit: 'Unit 3',
      bookedOn: '2026-07-05T10:00:00.000Z',
      room: 'GYN-202',
    },
  ],
}
