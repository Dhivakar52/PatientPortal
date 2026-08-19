import React from 'react'
import { Button } from '@/components/ui/button'
import { LoginOtp } from './LoginOtp'
import { digitsOnly } from '@/utils/patient.utils'
import { Smartphone, Shield, ArrowRight, Phone } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 font-sans">
      {/* <PatientHeader /> */}

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
          {/* Header Section */}
          <div className="relative overflow-hidden px-8 py-7" style={{ background: "var(--blue-text-color)" }}>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-7 h-7 text-white/90" />
                <div className="font-bold text-xl text-white tracking-tight">Secure Login</div>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-white/70" />
                <p className="text-sm text-white/90 font-medium">Verify your mobile number to continue</p>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/5 rounded-full"></div>
          </div>

          {/* Form Section */}
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Phone className="w-5 h-5" style={{ color: "var(--blue-text-color)" }} />
                Mobile Number
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enter your 10-digit mobile number to receive OTP</p>
            </div>

            {/* Mobile Input */}
            <div className="space-y-2">
              <div className="flex items-stretch border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all duration-200"
                style={{ borderRadius: "4px" }}>
                <span className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center border-r-2 border-slate-200 dark:border-slate-700">
                  +91
                </span>
                <input
                  type="text"
                  value={loginMobileInput}
                  onChange={(e) => setLoginMobileInput(digitsOnly(e.target.value, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && onGenerateOtp()}
                  placeholder="Enter mobile number"
                  className="flex-1 px-4 py-2.5 text-sm outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  maxLength={10}
                  autoFocus
                />
              </div>
              {loginMobileErr && (
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-500 text-xs">⚠</span>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{loginMobileErr}</p>
                </div>
              )}
            </div>

            {/* Generate OTP Button */}
            <Button
              onClick={onGenerateOtp}
              className="w-full text-white font-semibold cursor-pointer py-6 text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--blue-btn)', borderRadius: "4px" }}
              disabled={loginMobileInput.length !== 10}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Generate OTP
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* OTP Section */}
            {showLoginOtpBlock && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-2">
                <LoginOtp
                  loginOtpInput={loginOtpInput}
                  setLoginOtpInput={setLoginOtpInput}
                  loginOtpErr={loginOtpErr}
                  onVerify={onVerifyOtp}
                  onResend={onResendOtp}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientLogin