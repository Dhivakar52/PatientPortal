import React, { useState, useEffect } from 'react'
import { X, Loader2, UserCheck, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextField, DobDateField, SelectField } from '@/components/FormPrimitives'
import { type Patient } from '@/types/patient.types'
import { updatePatient, type UpdatePatientRequest } from '@/services/apiService'
import { calcAge, digitsOnly } from '@/utils/patient.utils'
import { toast } from '@/components/ui/toast'
import { useStatesQuery, useCitiesQuery } from '@/hooks/queries/useMasterDataQueries'

interface EditPatientModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  currentUserId?: number | null
  onSuccess?: (updatedPatient: Patient) => void
}

const parseDateToIso = (dateStr: string): string => {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  // If DD-MM-YYYY or DD/MM/YYYY
  const ddMmMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (ddMmMatch) {
    const day = ddMmMatch[1].padStart(2, '0')
    const month = ddMmMatch[2].padStart(2, '0')
    const year = ddMmMatch[3]
    return `${year}-${month}-${day}`
  }
  // If DD-MMM-YYYY (e.g. 24-AUG-1995 or 24-Aug-1995)
  const ddMmmMatch = trimmed.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{4})/)
  if (ddMmmMatch) {
    const day = ddMmmMatch[1].padStart(2, '0')
    const monthStr = ddMmmMatch[2].toUpperCase()
    const year = ddMmmMatch[3]
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const mIdx = months.indexOf(monthStr)
    if (mIdx !== -1) {
      const month = String(mIdx + 1).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  // Try standard Date constructor
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    const d = String(parsed.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return trimmed
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  currentUserId,
  onSuccess,
}) => {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [dob, setDob] = useState('')
  const [age, setAge] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [stateId, setStateId] = useState<string>('')
  const [cityId, setCityId] = useState<string>('')
  const [pinCode, setPinCode] = useState('')
  const [area, setArea] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Master Data Queries for States & Cities
  const { data: rawStates, isLoading: isLoadingStates } = useStatesQuery({ enabled: isOpen })
  const statesList = Array.isArray(rawStates) ? rawStates : []
  const { data: rawCities, isLoading: isLoadingCities } = useCitiesQuery(stateId || undefined, {
    enabled: isOpen && Boolean(stateId),
  })
  const citiesList = Array.isArray(rawCities) ? rawCities : []

  // Pre-populate fields when patient changes or modal opens
  useEffect(() => {
    if (patient && isOpen) {
      setName(patient.PatientName || patient.name || '')
      
      const rawGender = String(patient.Gender || patient.gender || 'Male').toLowerCase()
      if (patient.GenderID === 2 || rawGender === 'female') {
        setGender('Female')
      } else if (patient.GenderID === 3 || rawGender === 'other') {
        setGender('Other')
      } else {
        setGender('Male')
      }

      const isoDob = parseDateToIso(patient.DOB || patient.dob || '')
      setDob(isoDob)
      setAge(patient.Age !== undefined && patient.Age !== null ? String(patient.Age) : (isoDob ? String(calcAge(isoDob)) : ''))

      const registeredMobile =
        patient.PhoneNo ||
        patient.phoneNo ||
        patient.mobile ||
        (patient as any).Mobile ||
        (patient as any).MobileNo ||
        (patient as any).mobileNo ||
        localStorage.getItem('srm_patient_current_mobile') ||
        localStorage.getItem('mobileNo') ||
        localStorage.getItem('userMobile') ||
        ''
      setMobileNo(registeredMobile)
      setEmail(patient.Email || patient.email || '')
      setAddress(patient.Address || patient.PatientAddress || patient.address || '')
      
      const existingStateId = patient.StateID ?? patient.stateID ?? ''
      setStateId(existingStateId ? String(existingStateId) : '')

      const existingCityId = patient.CityID ?? patient.cityID ?? ''
      setCityId(existingCityId ? String(existingCityId) : '')

      setPinCode(patient.PinCode || patient.pincode || '')
      setArea((patient as unknown as Record<string, unknown>).area ? String((patient as unknown as Record<string, unknown>).area) : '')
      setErrors({})
    }
  }, [patient, isOpen])

  if (!isOpen || !patient) return null

  const dobDate = dob ? new Date(dob) : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dobStr = `${year}-${month}-${day}`
      setDob(dobStr)
      const computed = calcAge(dobStr)
      if (typeof computed === 'number') {
        setAge(String(computed))
      }
    } else {
      setDob('')
    }
  }

  const handleAgeChange = (val: string) => {
    const digits = digitsOnly(val, 3)
    setAge(digits)
  }

  const handleStateChange = (newVal: string) => {
    setStateId(newVal)
    setCityId('') // Reset city on state change
  }

  const stateOptions = statesList.map((s) => ({
    value: String(s.StateID),
    label: s.StateName,
  }))

  const cityOptions = citiesList.map((c) => ({
    value: String(c.CityID),
    label: c.CityName,
  }))

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    // Validation
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Patient name is required.'

    // Check Date of Birth or Age (at least one is required)
    const hasDob = Boolean(dob && dob.trim())
    const parsedAge = parseInt(age, 10)
    const hasAge = Boolean(age && !isNaN(parsedAge) && parsedAge > 0 && parsedAge <= 150)

    if (!hasDob && !hasAge) {
      newErrors.dob = 'Please enter Date of Birth or Age.'
      newErrors.age = 'Please enter Date of Birth or Age.'
    }

    const cleanMobile = mobileNo.trim()
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNo = 'Enter a valid 10-digit mobile number.'
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (pinCode.trim() && !/^\d{6}$/.test(pinCode.trim())) {
      newErrors.pinCode = 'Enter a valid 6-digit PIN code.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    const patientId = Number(patient.PatientID || patient.id)
    const genderCode = gender === 'Male' ? 1 : gender === 'Female' ? 2 : 3

    let ageValue = 0
    if (hasAge) {
      ageValue = parsedAge
    } else if (hasDob) {
      const computedAge = calcAge(dob)
      ageValue = typeof computedAge === 'number' ? computedAge : (patient.Age || 0)
    }

    let finalDob = dob.trim()
    if (!finalDob && ageValue > 0) {
      const birthYear = new Date().getFullYear() - ageValue
      finalDob = `${birthYear}-01-01`
    }

    const loggedInUserId = Number(currentUserId ?? patient.UserID ?? patient.userID ?? localStorage.getItem('userID') ?? 0) || 0

    const stateIdNum = Number(stateId) || Number(patient.StateID ?? patient.stateID ?? 0) || 0
    const cityIdNum = Number(cityId) || Number(patient.CityID ?? patient.cityID ?? 0) || 0
    const countryIdNum = Number(patient.CountryID ?? patient.countryID ?? 1) || 1
    const finalFormattedDob = parseDateToIso(dob)

    const payload: UpdatePatientRequest = {
      userID: Number(patient.UserID ?? patient.userID ?? loggedInUserId) || 0,
      name: name.trim(),
      email: email.trim(),
      gender: genderCode,
      dob: finalFormattedDob,
      age: Number(ageValue) || 0,
      mobileNo: cleanMobile,
      address: address.trim(),
      pinCode: pinCode.trim(),
      createdBy: Number((patient as any).CreatedBy ?? (patient as any).createdBy ?? loggedInUserId) || loggedInUserId || 0,
      updatedBy: loggedInUserId,
      countryID: countryIdNum,
      cityID: cityIdNum,
      stateID: stateIdNum,
      area: area.trim(),
    }

    try {
      console.log(`🚀 Updating patient ${patientId} with payload:`, payload)
      await updatePatient(patientId, payload)
      toast.success('Patient details updated successfully!')

      const updatedPatientObj: Patient = {
        ...patient,
        PatientID: patientId,
        PatientName: name.trim(),
        name: name.trim(),
        DOB: finalFormattedDob,
        dob: finalFormattedDob,
        Age: ageValue,
        GenderID: genderCode,
        Gender: gender,
        gender: gender,
        PhoneNo: cleanMobile,
        mobile: cleanMobile,
        phoneNo: cleanMobile,
        Email: email.trim() || undefined,
        email: email.trim() || undefined,
        Address: address.trim(),
        PatientAddress: address.trim(),
        address: address.trim(),
        StateID: stateIdNum,
        stateID: stateIdNum,
        CityID: cityIdNum,
        cityID: cityIdNum,
        PinCode: pinCode.trim(),
        pincode: pinCode.trim(),
      }

      onSuccess?.(updatedPatientObj)
      onClose()
    } catch (err: unknown) {
      console.error('Update Patient Error:', err)
      const error = err as { response?: { data?: { message?: string; Result?: string; errors?: Record<string, string[]> } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to update patient details. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        if (resData.errors && typeof resData.errors === 'object') {
          const firstErrList = Object.values(resData.errors)[0]
          if (Array.isArray(firstErrList) && firstErrList.length > 0) {
            message = firstErrList[0]
          }
        } else {
          message = resData.message || resData.Result || message
        }
      } else if (error.message) {
        message = error.message
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Edit Patient Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update patient profile information</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form Fields */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <FieldLabel required>Patient Name</FieldLabel>
              <TextField
                value={name}
                onChange={setName}
                placeholder="Full Name"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Mobile Number - Registered / Disabled */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel required>Mobile Number</FieldLabel>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Registered Mobile
                </span>
              </div>
              <div className="relative">
                <TextField
                  value={mobileNo}
                  onChange={(v) => setMobileNo(digitsOnly(v, 10))}
                  placeholder="10-digit Mobile Number"
                  disabled={true}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              {errors.mobileNo && <p className="text-xs text-rose-600 mt-1">{errors.mobileNo}</p>}
            </div>

            {/* Gender */}
            <div>
              <FieldLabel required>Gender</FieldLabel>
              <div className="flex items-center gap-4 h-9">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <label key={g} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="editGender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      disabled={isSubmitting}
                      className="accent-blue-600"
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <FieldLabel>Date of Birth <span className="text-slate-400 font-normal text-[11px]">(or Age)</span></FieldLabel>
              <DobDateField
                value={dobDate}
                onChange={handleDateSelect}
                placeholder="Select Date of Birth"
                defaultLabel="Select Date of Birth"
                disabled={isSubmitting}
              />
              {errors.dob && <p className="text-xs text-rose-600 mt-1">{errors.dob}</p>}
            </div>

            {/* Age */}
            <div>
              <FieldLabel>Age <span className="text-slate-400 font-normal text-[11px]">(or DOB)</span></FieldLabel>
              <TextField
                value={age || (dob ? String(calcAge(dob)) : '')}
                onChange={handleAgeChange}
                placeholder="e.g. 28"
                type="text"
                disabled={isSubmitting}
              />
              {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
            </div>

            {/* Email */}
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <TextField
                value={email}
                onChange={setEmail}
                placeholder="e.g. patient@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* State */}
            <div>
              <FieldLabel>State</FieldLabel>
              <SelectField
                options={stateOptions}
                value={stateId}
                onChange={handleStateChange}
                placeholder={isLoadingStates ? 'Loading states...' : 'Select State'}
                disabled={isSubmitting || isLoadingStates}
              />
            </div>

            {/* City */}
            <div>
              <FieldLabel>City</FieldLabel>
              <SelectField
                options={cityOptions}
                value={cityId}
                onChange={setCityId}
                placeholder={!stateId ? 'Select state first' : isLoadingCities ? 'Loading cities...' : 'Select City'}
                disabled={isSubmitting || !stateId || isLoadingCities}
              />
            </div>

            {/* PIN Code */}
            <div>
              <FieldLabel>PIN Code</FieldLabel>
              <TextField
                value={pinCode}
                onChange={(v) => setPinCode(digitsOnly(v, 6))}
                placeholder="6-digit PIN"
                disabled={isSubmitting}
              />
              {errors.pinCode && <p className="text-xs text-rose-600 mt-1">{errors.pinCode}</p>}
            </div>

            {/* Area */}
            <div>
              <FieldLabel>Area</FieldLabel>
              <TextField
                value={area}
                onChange={setArea}
                placeholder="e.g. Vadapalani"
                disabled={isSubmitting}
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <FieldLabel>Address</FieldLabel>
              <TextField
                value={address}
                onChange={setAddress}
                placeholder="House no, street, area"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs cursor-pointer border-slate-300 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-white font-semibold cursor-pointer text-xs px-5 py-2 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--blue-btn)', borderRadius: '6px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
