import React from 'react'
import { Button } from '@/components/ui/button'
import { digitsOnly } from '@/utils/patient.utils'

interface LoginOtpProps {
  loginOtpInput: string
  setLoginOtpInput: (v: string) => void
  loginOtpErr: string
  onVerify: () => void
  onResend: () => void
}

export const LoginOtp: React.FC<LoginOtpProps> = ({
  loginOtpInput,
  setLoginOtpInput,
  loginOtpErr,
  onVerify,
  onResend,
}) => {
  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/40 border border-dashed border-blue-300 dark:border-blue-800 rounded space-y-3">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        Enter OTP
      </label>
      <input
        type="text"
        value={loginOtpInput}
        onChange={(e) => setLoginOtpInput(digitsOnly(e.target.value, 4))}
        onKeyDown={(e) => e.key === 'Enter' && onVerify()}
        placeholder="••••"
        className="w-full text-center tracking-[6px] text-lg font-bold border border-slate-300 dark:border-slate-700 rounded p-2 outline-none focus:border-blue-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
        maxLength={4}
      />
      {loginOtpErr && <p className="text-xs text-rose-600">{loginOtpErr}</p>}
      <Button
        onClick={onVerify}
        className="w-full text-white font-semibold cursor-pointer"
        style={{ background: 'var(--blue-btn)' }}
      >
        Login
      </Button>
      <button
        type="button"
        onClick={onResend}
        className="block text-xs text-blue-600 dark:text-blue-400 hover:underline mx-auto cursor-pointer"
      >
        Resend OTP
      </button>
    </div>
  )
}
