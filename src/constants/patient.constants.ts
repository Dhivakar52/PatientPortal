import { type UserRecord, type Appointment } from '../types/patient.types'
export { SmsTemplateId, SMS_TEMPLATE_IDS, type SmsTemplateIdType } from './sms.constants'

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

export const INITIAL_USERS: Record<string, UserRecord> = {}

export const INITIAL_APPOINTMENTS: Record<string, Appointment[]> = {}

