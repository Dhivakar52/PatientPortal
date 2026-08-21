import React from 'react'
import { ShieldCheck, X } from 'lucide-react'
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xl mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">OTP Verification</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          OTP has been sent to your registered mobile number <b className="text-slate-800 dark:text-slate-200">+91 {patientMobile}</b>.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Enter OTP
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={bookOtpInput}
              onChange={(e) => setBookOtpInput(digitsOnly(e.target.value, 4))}
              onKeyDown={(e) => e.key === 'Enter' && bookOtpInput.length === 4 && onVerify()}
              placeholder="• • • •"
              className="w-full text-center tracking-[8px] text-xl font-bold border-2 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
              maxLength={4}
              autoFocus
            />
            {bookOtpErr && <p className="text-xs text-rose-600 mt-1.5">{bookOtpErr}</p>}
          </div>

          <Button
            onClick={onVerify}
            disabled={bookOtpInput.length !== 4}
            className="w-full text-white font-semibold cursor-pointer py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--blue-btn)', borderRadius: '4px' }}
          >
            Verify OTP
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onResend}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

