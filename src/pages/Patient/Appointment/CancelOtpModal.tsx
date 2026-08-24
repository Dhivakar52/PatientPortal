import React from 'react'
import { CalendarX, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { digitsOnly } from '@/utils/patient.utils'
import { type Appointment } from '@/types/patient.types'

interface CancelOtpModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  patientMobile?: string
  otpInput: string
  setOtpInput: (v: string) => void
  otpErr: string
  isVerifying?: boolean
  isResending?: boolean
  onVerify: () => void
  onResend: () => void
}

export const CancelOtpModal: React.FC<CancelOtpModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patientMobile,
  otpInput,
  setOtpInput,
  otpErr,
  isVerifying = false,
  isResending = false,
  onVerify,
  onResend,
}) => {
  if (!isOpen || !appointment) return null

  const apptNo = appointment.AppointmentNo || appointment.apptNo || appointment.AppointmentID || ''
  const displayDoc = appointment.doctor || appointment.DoctorName || 'Specialist Consultation'
  const displayDate = appointment.date || appointment.AppointmentDate || ''

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isVerifying}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xl mb-3">
          <CalendarX className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cancel Appointment</h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          An OTP has been sent to your registered mobile number <b className="text-slate-800 dark:text-slate-200">+91 {patientMobile}</b> to confirm cancellation.
        </p>

        {/* Appointment summary chip */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs mb-4 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Appointment:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">#{apptNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Doctor:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{displayDoc}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{displayDate}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Enter OTP
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={otpInput}
              onChange={(e) => setOtpInput(digitsOnly(e.target.value, 4))}
              onKeyDown={(e) => e.key === 'Enter' && otpInput.length === 4 && onVerify()}
              placeholder="• • • •"
              className="w-full text-center tracking-[8px] text-xl font-bold border-2 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-rose-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
              maxLength={4}
              autoFocus
            />
            {otpErr && <p className="text-xs text-rose-600 mt-1.5">{otpErr}</p>}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 cursor-pointer border-slate-300 dark:border-slate-700"
            >
              Back
            </Button>
            <Button
              onClick={onVerify}
              disabled={otpInput.length !== 4 || isVerifying}
              className="flex-1 text-white font-semibold cursor-pointer py-2.5 text-sm bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: '4px' }}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Cancelling...
                </>
              ) : (
                'Verify & Cancel'
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onResend}
              disabled={isResending || isVerifying}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              {isResending ? 'Sending OTP...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
