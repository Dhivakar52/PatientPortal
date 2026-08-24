import React from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextField, DobDateField, SelectField } from '@/components/FormPrimitives'
import { PatientHeader } from '@/common/PatientHeader'
import { calcAge, digitsOnly } from '@/utils/patient.utils'
import { Loader2 } from 'lucide-react'

// Indian States and Cities options for Dropdowns
export const INDIAN_STATES = [
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Puducherry', label: 'Puducherry' },
]

export const STATE_CITIES_MAP: Record<string, { value: string; label: string }[]> = {
  'Tamil Nadu': [
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Chengalpattu', label: 'Chengalpattu' },
    { value: 'Kancheepuram', label: 'Kancheepuram' },
    { value: 'Thiruvallur', label: 'Thiruvallur' },
    { value: 'Coimbatore', label: 'Coimbatore' },
    { value: 'Madurai', label: 'Madurai' },
    { value: 'Tiruchirappalli', label: 'Tiruchirappalli' },
    { value: 'Salem', label: 'Salem' },
    { value: 'Tirunelveli', label: 'Tirunelveli' },
    { value: 'Vellore', label: 'Vellore' },
    { value: 'Erode', label: 'Erode' },
    { value: 'Thanjavur', label: 'Thanjavur' },
    { value: 'Dindigul', label: 'Dindigul' },
    { value: 'Cuddalore', label: 'Cuddalore' },
    { value: 'Kanyakumari', label: 'Kanyakumari' },
    { value: 'Tiruppur', label: 'Tiruppur' },
    { value: 'Tuticorin', label: 'Tuticorin' },
    { value: 'Nagercoil', label: 'Nagercoil' },
    { value: 'Hosur', label: 'Hosur' },
  ],
  'Karnataka': [
    { value: 'Bengaluru', label: 'Bengaluru' },
    { value: 'Mysuru', label: 'Mysuru' },
    { value: 'Mangaluru', label: 'Mangaluru' },
    { value: 'Hubballi', label: 'Hubballi' },
    { value: 'Belagavi', label: 'Belagavi' },
    { value: 'Davanagere', label: 'Davanagere' },
  ],
  'Andhra Pradesh': [
    { value: 'Visakhapatnam', label: 'Visakhapatnam' },
    { value: 'Vijayawada', label: 'Vijayawada' },
    { value: 'Guntur', label: 'Guntur' },
    { value: 'Tirupati', label: 'Tirupati' },
    { value: 'Nellore', label: 'Nellore' },
    { value: 'Kurnool', label: 'Kurnool' },
    { value: 'Rajahmundry', label: 'Rajahmundry' },
    { value: 'Kakinada', label: 'Kakinada' },
  ],
  'Kerala': [
    { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
    { value: 'Kochi', label: 'Kochi' },
    { value: 'Kozhikode', label: 'Kozhikode' },
    { value: 'Thrissur', label: 'Thrissur' },
    { value: 'Kollam', label: 'Kollam' },
    { value: 'Kannur', label: 'Kannur' },
    { value: 'Palakkad', label: 'Palakkad' },
    { value: 'Alappuzha', label: 'Alappuzha' },
  ],
  'Telangana': [
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Warangal', label: 'Warangal' },
    { value: 'Nizamabad', label: 'Nizamabad' },
    { value: 'Karimnagar', label: 'Karimnagar' },
    { value: 'Khammam', label: 'Khammam' },
  ],
  'Maharashtra': [
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Nagpur', label: 'Nagpur' },
    { value: 'Nashik', label: 'Nashik' },
    { value: 'Thane', label: 'Thane' },
    { value: 'Aurangabad', label: 'Aurangabad' },
    { value: 'Navi Mumbai', label: 'Navi Mumbai' },
  ],
  'Delhi': [
    { value: 'New Delhi', label: 'New Delhi' },
    { value: 'North Delhi', label: 'North Delhi' },
    { value: 'South Delhi', label: 'South Delhi' },
    { value: 'West Delhi', label: 'West Delhi' },
    { value: 'East Delhi', label: 'East Delhi' },
  ],
  'Gujarat': [
    { value: 'Ahmedabad', label: 'Ahmedabad' },
    { value: 'Surat', label: 'Surat' },
    { value: 'Vadodara', label: 'Vadodara' },
    { value: 'Rajkot', label: 'Rajkot' },
  ],
  'Puducherry': [
    { value: 'Puducherry', label: 'Puducherry' },
    { value: 'Karaikal', label: 'Karaikal' },
    { value: 'Mahe', label: 'Mahe' },
    { value: 'Yanam', label: 'Yanam' },
  ],
}

export const ALL_MAJOR_CITIES = [
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Chengalpattu', label: 'Chengalpattu' },
  { value: 'Kancheepuram', label: 'Kancheepuram' },
  { value: 'Thiruvallur', label: 'Thiruvallur' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Tiruchirappalli', label: 'Tiruchirappalli' },
  { value: 'Salem', label: 'Salem' },
  { value: 'Bengaluru', label: 'Bengaluru' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Visakhapatnam', label: 'Visakhapatnam' },
  { value: 'Vijayawada', label: 'Vijayawada' },
  { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
  { value: 'Kochi', label: 'Kochi' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'New Delhi', label: 'New Delhi' },
  { value: 'Puducherry', label: 'Puducherry' },
]

interface PatientRegistrationProps {
  pendingMobile: string
  regName: string
  setRegName: (v: string) => void
  regGender: 'Male' | 'Female' | 'Other'
  setRegGender: (v: 'Male' | 'Female' | 'Other') => void
  regDob: string
  setRegDob: (v: string) => void
  regAddress: string
  setRegAddress: (v: string) => void
  regCity: string
  setRegCity: (v: string) => void
  regState: string
  setRegState: (v: string) => void
  regPincode: string
  setRegPincode: (v: string) => void
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
  regAddress,
  setRegAddress,
  regCity,
  setRegCity,
  regState,
  setRegState,
  regPincode,
  setRegPincode,
  regErrors,
  isSubmitting = false,
  onSubmit,
  onBack,
}) => {
  const calculatedAge = calcAge(regDob)

  const dobDate = regDob ? new Date(regDob) : undefined

  // Filter cities based on selected State
  const availableCityOptions = regState && STATE_CITIES_MAP[regState]
    ? STATE_CITIES_MAP[regState]
    : ALL_MAJOR_CITIES

  const handleStateChange = (val: string) => {
    setRegState(val)
    if (val && STATE_CITIES_MAP[val]) {
      const cities = STATE_CITIES_MAP[val]
      if (regCity && !cities.some((c) => c.value === regCity)) {
        setRegCity('')
      }
    }
  }

  // ✅ FIX: Use local date to avoid timezone issues
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      setRegDob(`${year}-${month}-${day}`)
    } else {
      setRegDob('')
    }
  }

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
              <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
                {regErrors.form}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
              {/* Mobile Number - Readonly */}
              <div>
                <FieldLabel required>Mobile Number</FieldLabel>
                <div className="border border-slate-200 dark:border-slate-800 rounded p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm h-9 flex items-center">
                  +91 {pendingMobile}
                </div>
                {regErrors.mobile && <p className="text-xs text-rose-600 mt-1">{regErrors.mobile}</p>}
              </div>

              {/* Full Name */}
              <div>
                <FieldLabel required>Full Name</FieldLabel>
                <TextField
                  value={regName}
                  onChange={setRegName}
                  placeholder="e.g. Priya Kumar"
                />
                {regErrors.name && <p className="text-xs text-rose-600 mt-1">{regErrors.name}</p>}
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
                <FieldLabel required>Date of Birth</FieldLabel>
                <DobDateField
                  value={dobDate}
                  onChange={handleDateSelect}
                  placeholder="Select Date of Birth"
                  defaultLabel="Select Date of Birth"
                />
                {regErrors.dob && <p className="text-xs text-rose-600 mt-1">{regErrors.dob}</p>}
              </div>

              {/* Age */}
              <div>
                <FieldLabel>Age</FieldLabel>
                <div className="border border-slate-200 dark:border-slate-800 rounded p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm h-9 flex items-center">
                  {calculatedAge === '' ? '—' : `${calculatedAge} Years`}
                </div>
              </div>

              {/* Address */}
              <div>
                <FieldLabel>Address</FieldLabel>
                <TextField
                  value={regAddress}
                  onChange={setRegAddress}
                  placeholder="House no, street"
                />
                {regErrors.address && <p className="text-xs text-rose-600 mt-1">{regErrors.address}</p>}
              </div>

              {/* State */}
              <div>
                <FieldLabel>State</FieldLabel>
                <SelectField
                  options={INDIAN_STATES}
                  value={regState}
                  onChange={handleStateChange}
                  placeholder="Select State"
                />
                {regErrors.state && <p className="text-xs text-rose-600 mt-1">{regErrors.state}</p>}
              </div>

              {/* City */}
              <div>
                <FieldLabel>City</FieldLabel>
                <SelectField
                  options={availableCityOptions}
                  value={regCity}
                  onChange={setRegCity}
                  placeholder="Select City"
                />
                {regErrors.city && <p className="text-xs text-rose-600 mt-1">{regErrors.city}</p>}
              </div>

              {/* PIN Code */}
              <div>
                <FieldLabel>PIN Code</FieldLabel>
                <TextField
                  value={regPincode}
                  onChange={(v) => setRegPincode(digitsOnly(v, 6))}
                  placeholder="6-digit PIN"
                />
                {regErrors.pincode && <p className="text-xs text-rose-600 mt-1">{regErrors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-4">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="cursor-pointer">
              Back
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
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