import React from 'react'
import { User, Venus, Mars, Loader2 } from 'lucide-react'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName, formatDateLong, calcAge } from '@/utils/patient.utils'

interface PatientProfileCardProps {
  currentPatient: Patient | null
  isLoadingPatient?: boolean
  patientError?: string | null
  className?: string
  lastVisitedDate?: string
}

export const PatientProfileCard: React.FC<PatientProfileCardProps> = ({
  currentPatient,
  isLoadingPatient = false,
  patientError = null,
  className = '',
  lastVisitedDate,
}) => {
  const displayLastVisited = lastVisitedDate || (currentPatient as any)?.LastVisitedDate || (currentPatient as any)?.lastVisitedDate || (currentPatient as any)?.LastVisitDate
  // Dynamic values directly from API response
  const rawName = currentPatient?.PatientName || currentPatient?.name || ''
  const gender = currentPatient?.Gender || currentPatient?.gender || '—'
  const salutation = gender.toLowerCase() === 'female' ? 'Ms.' : 'Mr.'
  const displayName = rawName
    ? `${salutation} ${capitalizeName(rawName.trim().split(/\s+/)[0] || rawName)}`
    : '—'
  const fullPatientName = rawName ? capitalizeName(rawName) : '—'

  const displayDob = currentPatient?.DOB || (currentPatient?.dob ? formatDateLong(currentPatient.dob) : '—')
  const displayAge = currentPatient?.Age !== undefined && currentPatient.Age !== null
    ? currentPatient.Age
    : (currentPatient?.dob ? calcAge(currentPatient.dob) : '—')

  const displayPhone = currentPatient?.PhoneNo || currentPatient?.phoneNo || currentPatient?.mobile || '—'
  const displayAddress = currentPatient?.Address || currentPatient?.PatientAddress || currentPatient?.address || '—'
  const displayCity = currentPatient?.City || currentPatient?.city || '—'
  const displayState = currentPatient?.State || currentPatient?.PatientState || currentPatient?.state || '—'
  const displayPinCode = currentPatient?.PinCode || currentPatient?.pincode || '—'
  const displayUhid = currentPatient?.UHID || '—'
  const displayRegisterNo = currentPatient?.RegisterNo || '—'
  const displayAbhaId = currentPatient?.AbhaID || '—'

  const getGenderIcon = () => {
    if (gender.toLowerCase() === 'female') return <Venus className="w-3.5 h-3.5 text-pink-500" />
    if (gender.toLowerCase() === 'male') return <Mars className="w-3.5 h-3.5 text-blue-500" />
    return <User className="w-3.5 h-3.5 text-slate-400" />
  }

  if (isLoadingPatient && !currentPatient) {
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shrink-0 shadow-sm flex flex-col items-center justify-center py-12 text-slate-400 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-xs">Loading patient profile...</p>
      </div>
    )
  }

  if (patientError && !currentPatient) {
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shrink-0 shadow-sm text-center py-8 ${className}`}>
        <p className="text-xs text-rose-500">{patientError}</p>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shrink-0 shadow-sm ${className}`}>
      {/* Header Info */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-md shadow-blue-500/20">
          {initials(rawName)}
        </div>
        <div className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
          {displayName}
        </div>
        <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {getGenderIcon()}
            {gender}
          </span>
          {displayAge !== '—' && (
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
              {displayAge} Years
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-800 my-4" />

      {/* Profile Details List */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Patient Name</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{fullPatientName}</span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Date of Birth</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayDob}</span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Age</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
            {displayAge !== '—' ? `${displayAge} Years` : '—'}
          </span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Gender</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{gender}</span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Phone Number</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
            {displayPhone !== '—' ? `+91 ${displayPhone}` : '—'}
          </span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Address</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right break-words max-w-[180px]">
            {displayAddress}
          </span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">City</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayCity}</span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">State</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayState}</span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">PIN Code</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayPinCode}</span>
        </div>

        {displayLastVisited && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Last Visited Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayLastVisited}</span>
          </div>
        )}

        <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-2.5 pt-2 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">UHID</span>
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
              {displayUhid}
            </span>
          </div>

          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Register No.</span>
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
              {displayRegisterNo}
            </span>
          </div>

          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">ABHA ID</span>
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
              {displayAbhaId}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
