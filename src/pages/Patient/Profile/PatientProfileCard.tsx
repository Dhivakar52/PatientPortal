import React, { useState } from 'react'
import { User, Venus, Mars, Edit3 } from 'lucide-react'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName, formatDateLong, calcAge } from '@/utils/patient.utils'
import { useStatesQuery, useCitiesQuery } from '@/hooks/queries/useMasterDataQueries'
import { EditPatientModal } from './EditPatientModal'
import { PageLoader } from '@/components/PageLoader'

interface PatientProfileCardProps {
  currentPatient: Patient | null
  isLoadingPatient?: boolean
  patientError?: string | null
  className?: string
  lastVisitedDate?: string
  currentUserId?: number | null
  onEditSuccess?: (updatedPatient: Patient) => void
}

export const PatientProfileCard: React.FC<PatientProfileCardProps> = ({
  currentPatient,
  isLoadingPatient = false,
  patientError = null,
  className = '',
  lastVisitedDate,
  currentUserId,
  onEditSuccess,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { data: rawStates } = useStatesQuery()
  const statesList = Array.isArray(rawStates) ? rawStates : []

  const rawState = currentPatient?.StateID ?? currentPatient?.stateID ?? currentPatient?.State ?? currentPatient?.PatientState ?? currentPatient?.state ?? ''
  const matchedState = statesList.find(
    (s) => String(s?.StateID) === String(rawState) || s?.StateName?.toLowerCase() === String(rawState).toLowerCase()
  )
  const displayState = matchedState ? matchedState.StateName : (String(rawState).match(/^\d+$/) ? '—' : (String(rawState) || '—'))

  const stateIdForCity = matchedState ? String(matchedState.StateID) : (String(rawState).match(/^\d+$/) ? String(rawState) : '')
  const { data: rawCities } = useCitiesQuery(stateIdForCity)
  const citiesList = Array.isArray(rawCities) ? rawCities : []
  const rawCity = currentPatient?.CityID ?? currentPatient?.cityID ?? currentPatient?.City ?? currentPatient?.city ?? ''
  const matchedCity = citiesList.find(
    (c) => String(c?.CityID) === String(rawCity) || c?.CityName?.toLowerCase() === String(rawCity).toLowerCase()
  )
  const displayCity = matchedCity ? matchedCity.CityName : (String(rawCity).match(/^\d+$/) ? '—' : (String(rawCity) || '—'))

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
  const displayEmail = currentPatient?.Email || currentPatient?.email || '—'
  const displayAddress = currentPatient?.Address || currentPatient?.PatientAddress || currentPatient?.address || '—'
  const displayPinCode = currentPatient?.PinCode || currentPatient?.pincode || '—'
  const displayUhid = currentPatient?.UHID || '—'
  const displayAbhaId = currentPatient?.AbhaID || '—'

  const getGenderIcon = () => {
    if (gender.toLowerCase() === 'female') return <Venus className="w-3.5 h-3.5 text-pink-500" />
    if (gender.toLowerCase() === 'male') return <Mars className="w-3.5 h-3.5 text-blue-500" />
    return <User className="w-3.5 h-3.5 text-slate-400" />
  }

  if (isLoadingPatient && !currentPatient) {
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0 shadow-sm ${className}`}>
        <PageLoader fullScreen={false} size="sm" message="Loading Profile..." subMessage="Fetching patient records" />
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
    <>
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shrink-0 shadow-sm relative ${className}`}>
        {/* Header Info */}
        <div className="text-center relative">
          {/* Edit Profile Button */}
          {currentPatient && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              title="Edit Patient Profile"
              className="absolute right-0 top-0 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

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
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Email</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right break-all">
              {displayEmail}
            </span>
          </div>

          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Address</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right break-words">
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

            {/* <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Register No.</span>
              <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
                {displayRegisterNo}
              </span>
            </div> */}

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">ABHA ID</span>
              <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
                {displayAbhaId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={currentPatient}
        currentUserId={currentUserId}
        onSuccess={(updated) => {
          onEditSuccess?.(updated)
        }}
      />
    </>
  )
}
