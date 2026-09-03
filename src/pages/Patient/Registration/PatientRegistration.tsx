import React from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextField, DobDateField, SelectField } from '@/components/FormPrimitives'
import { PatientHeader } from '@/common/PatientHeader'
import { calcAge, digitsOnly } from '@/utils/patient.utils'
import { Loader2 } from 'lucide-react'
import { useStatesQuery, useCitiesQuery } from '@/hooks/queries/useMasterDataQueries'

interface PatientRegistrationProps {
  pendingMobile: string
  regName: string
  setRegName: (v: string) => void
  regGender: 'Male' | 'Female' | 'Other'
  setRegGender: (v: 'Male' | 'Female' | 'Other') => void
  regDob: string
  setRegDob: (v: string) => void
  regAge?: string
  setRegAge?: (v: string) => void
  regAddress: string
  setRegAddress: (v: string) => void
  regCity: string
  setRegCity: (v: string) => void
  regState: string
  setRegState: (v: string) => void
  regPincode: string
  setRegPincode: (v: string) => void
  regEmail?: string
  setRegEmail?: (v: string) => void
  regErrors: Record<string, string>
  isSubmitting?: boolean
  onSubmit: () => void
  onBack: () => void
}

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  pendingMobile,
  regName,
  setRegName,
  regGender,
  setRegGender,
  regDob,
  setRegDob,
  regAge = '',
  setRegAge,
  regAddress,
  setRegAddress,
  regCity,
  setRegCity,
  regState,
  setRegState,
  regPincode,
  setRegPincode,
  regEmail = '',
  setRegEmail,
  regErrors,
  isSubmitting = false,
  onSubmit,
  onBack,
}) => {
  const { data: rawStates } = useStatesQuery()
  const statesList = Array.isArray(rawStates) ? rawStates : []

  // Resolve State ID for cities query in case regState is a name or ID
  const resolvedStateId = React.useMemo(() => {
    if (!regState) return ''
    if (/^\d+$/.test(regState)) return regState
    const found = statesList.find(
      (s) => s?.StateName?.toLowerCase() === regState.toLowerCase() || String(s?.StateID) === regState
    )
    return found ? String(found.StateID) : regState
  }, [regState, statesList])

  const { data: rawCities } = useCitiesQuery(resolvedStateId)
  const citiesList = Array.isArray(rawCities) ? rawCities : []

  const stateOptions = statesList.map((s) => ({
    value: String(s.StateID),
    label: s.StateName,
  }))

  const cityOptions = citiesList.map((c) => ({
    value: String(c.CityID),
    label: c.CityName,
  }))

  const handleStateChange = (val: string) => {
    setRegState(val)
    setRegCity('')
  }

  const dobDate = regDob ? new Date(regDob) : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dobStr = `${year}-${month}-${day}`
      setRegDob(dobStr)
      if (setRegAge) {
        const computed = calcAge(dobStr)
        if (typeof computed === 'number') {
          setRegAge(String(computed))
        }
      }
    } else {
      setRegDob('')
    }
  }

  const handleAgeChange = (val: string) => {
    const digits = digitsOnly(val, 3)
    if (setRegAge) {
      setRegAge(digits)
    }
  }

  const displayAgeValue = regAge || (regDob ? String(calcAge(regDob)) : '')

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <PatientHeader />

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Section header bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-lg px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center bg-blue-50 dark:bg-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">Register Patient</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">New account setup</div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-lg shadow-sm">
          <div className="p-6 sm:p-8">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              We couldn't find an account for this number. Please complete your details to continue.
            </p>

            {regErrors.form && (
              <div data-cy="reg-form-error" className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
                {regErrors.form}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
              {/* Mobile Number - Readonly */}
              <div>
                <FieldLabel required>Mobile Number</FieldLabel>
                <div data-cy="reg-mobile-display" className="border border-slate-200 dark:border-slate-800 rounded p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm h-9 flex items-center">
                  +91 {pendingMobile}
                </div>
                {regErrors.mobile && <p data-cy="reg-mobile-error" className="text-xs text-rose-600 mt-1">{regErrors.mobile}</p>}
              </div>

              {/* Full Name */}
              <div>
                <FieldLabel required>Full Name</FieldLabel>
                <TextField
                  value={regName}
                  onChange={setRegName}
                  placeholder="e.g. Priya Kumar"
                  dataCy="reg-name"
                />
                {regErrors.name && <p data-cy="reg-name-error" className="text-xs text-rose-600 mt-1">{regErrors.name}</p>}
              </div>

              {/* Gender */}
              <div>
                <FieldLabel required>Gender</FieldLabel>
                <div className="flex items-center gap-4 h-9">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="regGender"
                        value={g}
                        data-cy={`reg-gender-${g.toLowerCase()}`}
                        checked={regGender === g}
                        onChange={() => setRegGender(g)}
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
                  dataCy="reg-dob"
                />
                {regErrors.dob && <p data-cy="reg-dob-error" className="text-xs text-rose-600 mt-1">{regErrors.dob}</p>}
              </div>

              {/* Age */}
              <div>
                <FieldLabel>Age <span className="text-slate-400 font-normal text-[11px]">(or DOB)</span></FieldLabel>
                <TextField
                  value={displayAgeValue}
                  onChange={handleAgeChange}
                  placeholder="e.g. 28"
                  type="text"
                  dataCy="reg-age"
                />
                {regErrors.age && <p data-cy="reg-age-error" className="text-xs text-rose-600 mt-1">{regErrors.age}</p>}
              </div>

              {/* Address */}
              <div>
                <FieldLabel>Address</FieldLabel>
                <TextField
                  value={regAddress}
                  onChange={setRegAddress}
                  placeholder="House no, street"
                  dataCy="reg-address"
                />
                {regErrors.address && <p data-cy="reg-address-error" className="text-xs text-rose-600 mt-1">{regErrors.address}</p>}
              </div>

              {/* State */}
              <div>
                <FieldLabel>State</FieldLabel>
                <SelectField
                  options={stateOptions}
                  value={regState}
                  onChange={handleStateChange}
                  placeholder="Select State"
                  dataCy="reg-state"
                />
                {regErrors.state && <p data-cy="reg-state-error" className="text-xs text-rose-600 mt-1">{regErrors.state}</p>}
              </div>

              {/* City */}
              <div>
                <FieldLabel>City</FieldLabel>
                <SelectField
                  options={cityOptions}
                  value={regCity}
                  onChange={setRegCity}
                  placeholder="Select City"
                  dataCy="reg-city"
                />
                {regErrors.city && <p data-cy="reg-city-error" className="text-xs text-rose-600 mt-1">{regErrors.city}</p>}
              </div>

              {/* PIN Code */}
              <div>
                <FieldLabel>PIN Code</FieldLabel>
                <TextField
                  value={regPincode}
                  onChange={(v) => setRegPincode(digitsOnly(v, 6))}
                  placeholder="6-digit PIN"
                  dataCy="reg-pincode"
                />
                {regErrors.pincode && <p data-cy="reg-pincode-error" className="text-xs text-rose-600 mt-1">{regErrors.pincode}</p>}
              </div>

              {/* Email Address */}
              <div>
                <FieldLabel>Email Address</FieldLabel>
                <TextField
                  value={regEmail}
                  onChange={(v) => setRegEmail && setRegEmail(v)}
                  placeholder="e.g. user@example.com"
                  type="email"
                  dataCy="reg-email"
                />
                {regErrors.email && <p data-cy="reg-email-error" className="text-xs text-rose-600 mt-1">{regErrors.email}</p>}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-4">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="cursor-pointer" data-cy="reg-back-btn">
              Back
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              data-cy="reg-submit-btn"
              className="text-white cursor-pointer font-semibold px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--blue-btn)' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register & Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientRegistration