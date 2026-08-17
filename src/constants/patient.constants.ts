import { type UserRecord, type Appointment } from '../types/patient.types'

export const DOCTORS = ['Dr. Madhumitha', 'Dr. Ravi', 'Dr. Ganesh', 'Dr. Anu']
export const HOSPITAL_NAME = 'SRM Medical College Hospital and Research Centre'

export const UNIT_SLOTS: Record<string, string[]> = {
  'Unit 1': [
    '08:00-08:30',
    '08:30-09:00',
    '09:00-09:30',
    '09:30-10:00',
    '10:00-10:30',
    '10:30-11:00',
    '11:00-11:30',
    '11:30-12:00',
  ],
  'Unit 2': [
    '12:00-12:30',
    '12:30-13:00',
    '13:00-13:30',
    '13:30-14:00',
    '14:00-14:30',
    '14:30-15:00',
    '15:00-15:30',
    '15:30-16:00',
  ],
  'Unit 3': [
    '16:00-16:30',
    '16:30-17:00',
    '17:00-17:30',
    '17:30-18:00',
    '18:00-18:30',
    '18:30-19:00',
    '19:00-19:30',
    '19:30-20:00',
  ],
  'Unit 4': [
    '09:00-09:30',
    '11:00-11:30',
    '13:00-13:30',
    '15:00-15:30',
    '17:00-17:30',
    '19:00-19:30',
  ],
}

export const UNIT_BOOKED: Record<string, string[]> = {
  'Unit 1': ['08:30-09:00', '10:00-10:30'],
  'Unit 2': ['13:00-13:30', '14:30-15:00'],
  'Unit 3': ['17:00-17:30', '18:30-19:00'],
  'Unit 4': ['11:00-11:30', '17:00-17:30'],
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
