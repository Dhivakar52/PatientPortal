import React from 'react'
import { Button } from '@/components/ui/button'
import { PatientHeader } from '@/common/PatientHeader'
import { LoginOtp } from './LoginOtp'
import { digitsOnly } from '@/utils/patient.utils'

interface PatientLoginProps {
  loginMobileInput: string
  setLoginMobileInput: (v: string) => void
  loginMobileErr: string
  showLoginOtpBlock: boolean
  loginOtpInput: string
  setLoginOtpInput: (v: string) => void
  loginOtpErr: string
  onGenerateOtp: () => void
  onVerifyOtp: () => void
  onResendOtp: () => void
}

const PatientLogin: React.FC<PatientLoginProps> = ({
  loginMobileInput,
  setLoginMobileInput,
  loginMobileErr,
  showLoginOtpBlock,
  loginOtpInput,
  setLoginOtpInput,
  loginOtpErr,
  onGenerateOtp,
  onVerifyOtp,
  onResendOtp,
}) => {
  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <PatientHeader />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full shadow-lg overflow-hidden">
          <div className=" text-white p-6" style={{ background: "var( --blue-text-color)" }}>
            <div className="font-bold text-xl">Login</div>
            <div className="text-xs text-blue-200 mt-1">Verify your mobile number to continue</div>
          </div>
          <div className="p-8 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Enter your mobile number</h2>
            <div className="space-y-1.5">
              <div className="flex items-stretch border border-slate-300 dark:border-slate-700 rounded overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="bg-slate-100 dark:bg-slate-800 px-3 text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center border-r border-slate-300 dark:border-slate-700">
                  +91
                </span>
                <input
                  type="text"
                  value={loginMobileInput}
                  onChange={(e) => setLoginMobileInput(digitsOnly(e.target.value, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && onGenerateOtp()}
                  placeholder="10-digit mobile number"
                  className="flex-1 px-3 py-2 text-sm outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  maxLength={10}
                />
              </div>
              {loginMobileErr && <p className="text-xs text-rose-600">{loginMobileErr}</p>}
            </div>

            <Button
              onClick={onGenerateOtp}
              className="w-full text-white font-semibold cursor-pointer"
              style={{ background: 'var(--blue-btn)' }}
            >
              Generate OTP
            </Button>

            {showLoginOtpBlock && (
              <LoginOtp
                loginOtpInput={loginOtpInput}
                setLoginOtpInput={setLoginOtpInput}
                loginOtpErr={loginOtpErr}
                onVerify={onVerifyOtp}
                onResend={onResendOtp}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientLogin