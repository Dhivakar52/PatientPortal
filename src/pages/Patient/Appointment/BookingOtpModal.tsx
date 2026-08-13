import React from 'react'
import { Lock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { digitsOnly } from '@/utils/patient.utils'

interface BookingOtpModalProps {
  isOpen: boolean
  onClose: () => void
  patientMobile?: string
  bookOtpInput: string
  setBookOtpInput: (v: string) => void
  bookOtpErr: string
  onVerify: () => void
  onResend: () => void
}

export const BookingOtpModal: React.FC<BookingOtpModalProps> = ({
  isOpen,
  onClose,
  patientMobile,
  bookOtpInput,
  setBookOtpInput,
  bookOtpErr,
  onVerify,
  onResend,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xl mb-3">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Confirm your appointment</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Enter the OTP sent to <b className="text-slate-800 dark:text-slate-200">+91 {patientMobile}</b>
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={bookOtpInput}
            onChange={(e) => setBookOtpInput(digitsOnly(e.target.value, 4))}
            onKeyDown={(e) => e.key === 'Enter' && onVerify()}
            placeholder="••••"
            className="w-full text-center tracking-[6px] text-lg font-bold border border-slate-300 dark:border-slate-700 rounded p-2 outline-none focus:border-blue-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            maxLength={4}
          />
          {bookOtpErr && <p className="text-xs text-rose-600">{bookOtpErr}</p>}

          <Button
            onClick={onVerify}
            className="w-full text-white font-semibold cursor-pointer"
            style={{ background: 'var(--blue-btn)' }}
          >
            Verify &amp; Continue
          </Button>

          <button
            type="button"
            onClick={onResend}
            className="block text-xs text-blue-600 dark:text-blue-400 hover:underline mx-auto cursor-pointer"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  )
}
