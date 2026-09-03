import React from 'react'
import { CalendarX, Loader2, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { digitsOnly } from '@/utils/patient.utils'
import { type Appointment } from '@/types/patient.types'

interface CancelOtpModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  patientMobile?: string
  step: 'reason' | 'otp'
  reason: string
  setReason: (v: string) => void
  reasonErr: string
  isGeneratingOtp?: boolean
  onContinueToOtp: () => void
  otpInput: string
  setOtpInput: (v: string) => void
  otpErr: string
  isVerifying?: boolean
  isResending?: boolean
  onVerify: () => void
  onResend: () => void
  onBackToReason: () => void
}

export const CancelOtpModal: React.FC<CancelOtpModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patientMobile,
  step = 'reason',
  reason,
  setReason,
  reasonErr,
  isGeneratingOtp = false,
  onContinueToOtp,
  otpInput,
  setOtpInput,
  otpErr,
  isVerifying = false,
  isResending = false,
  onVerify,
  onResend,
  onBackToReason,
}) => {
  if (!isOpen || !appointment) return null

  const apptNo = appointment.AppointmentNo || appointment.apptNo || appointment.AppointmentID || ''
  const displayDate = appointment.date || appointment.AppointmentDate || ''

  return (
    <div data-cy="cancel-modal" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          data-cy="cancel-modal-close-btn"
          disabled={isGeneratingOtp || isVerifying}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xl mb-3">
          <CalendarX className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cancel Appointment</h3>

        {/* Appointment summary card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs my-3 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Appointment:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">#{apptNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{displayDate}</span>
          </div>
        </div>

        {step === 'reason' ? (
          /* STEP 1: Enter Cancel Reason */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Reason for cancellation <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                data-cy="cancel-reason-input"
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter cancellation reason"
                rows={3}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-rose-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-colors"
                autoFocus
              />
              {reasonErr && (
                <div data-cy="cancel-reason-error" className="flex items-center gap-1 text-xs text-rose-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{reasonErr}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isGeneratingOtp}
                className="flex-1 text-xs font-medium py-2.5 border-slate-200 dark:border-slate-700 cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                Close
              </Button>
              <Button
                type="button"
                data-cy="cancel-continue-btn"
                onClick={onContinueToOtp}
                disabled={!reason.trim() || isGeneratingOtp}
                className="flex-1 text-white font-semibold cursor-pointer py-2.5 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: '4px' }}
              >
                {isGeneratingOtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: Enter & Verify OTP */
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-500">Reason:</span> {reason}
              </p>
              <p className="text-xs text-slate-500">
                OTP sent to your registered mobile number <b className="text-slate-800 dark:text-slate-200">+91 {patientMobile}</b>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Enter OTP
              </label>
              <input
                type="tel"
                inputMode="numeric"
                data-cy="cancel-otp-input"
                value={otpInput}
                onChange={(e) => setOtpInput(digitsOnly(e.target.value, 4))}
                onKeyDown={(e) => e.key === 'Enter' && otpInput.length === 4 && !isVerifying && onVerify()}
                placeholder="• • • •"
                className="w-full text-center tracking-[8px] text-xl font-bold border-2 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-rose-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                maxLength={4}
                autoFocus
              />
              {otpErr && (
                <div data-cy="cancel-otp-error" className="flex items-center gap-1 text-xs text-rose-600 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{otpErr}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                data-cy="cancel-back-btn"
                onClick={onBackToReason}
                disabled={isVerifying}
                className="flex-1 text-xs font-medium py-2.5 border-slate-200 dark:border-slate-700 cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                Back
              </Button>
              <Button
                type="button"
                data-cy="cancel-verify-otp-btn"
                onClick={onVerify}
                disabled={otpInput.length !== 4 || isVerifying}
                className="flex-1 text-white font-semibold cursor-pointer py-2.5 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: '4px' }}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Cancelling...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                data-cy="cancel-resend-otp-btn"
                onClick={onResend}
                disabled={isResending || isVerifying}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                {isResending ? 'Sending OTP...' : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
