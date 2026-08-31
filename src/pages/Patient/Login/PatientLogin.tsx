import React from 'react'
import { Button } from '@/components/ui/button'
import { LoginOtp } from './LoginOtp'
import { digitsOnly } from '@/utils/patient.utils'
import srmLogo from '@/assets/images/srm_logo.png'
import { Smartphone, ArrowRight, Phone, Loader2, CheckCircle2 } from 'lucide-react'
import { PageLoader } from '@/components/PageLoader'

interface PatientLoginProps {
  loginMobileInput: string
  setLoginMobileInput: (v: string) => void
  loginMobileErr: string
  showLoginOtpBlock: boolean
  loginOtpInput: string
  setLoginOtpInput: (v: string) => void
  loginOtpErr: string
  isGeneratingOtp?: boolean
  isVerifyingOtp?: boolean
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
  isGeneratingOtp = false,
  isVerifyingOtp = false,
  onGenerateOtp,
  onVerifyOtp,
  onResendOtp,
}) => {
  if (isVerifyingOtp) {
    return (
      <PageLoader
        message="Validating & Loading Data..."
        subMessage="Please wait while we fetch your patient profile"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
      {/* Header */}


      {/* Main Content */}
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden transition-all duration-300 hover:shadow-2xl">

            {/* Card Header */}
            <div
              className="relative px-8 pt-8 pb-6 overflow-hidden"
              style={{ background: "var(--blue-text-color)" }}
            >
              {/* Decorative Elements */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/5 rounded-full"></div>
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4 gap-3 min-w-0">
                  <div className="bg-white rounded p-1 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={srmLogo}
                      alt="SRM Logo"
                      width={48}
                      height={48}
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      className="w-9 sm:w-10 h-auto object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="font-bold text-white text-sm sm:text-base leading-snug">
                      SRM Medical College Hospital and Research Centre
                    </h1>
                    <div className="text-xs text-blue-200">Doctor Appointment</div>
                  </div>
                </div>


                <div className="flex items-start gap-2.5 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <Smartphone className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                  <p className="text-white/90 text-sm leading-relaxed">
                    Enter your mobile number to receive a secure OTP
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-8 py-6 space-y-6">
              {/* Mobile Number Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: "var(--blue-text-color)" }} />
                    Mobile Number
                  </label>
                  {showLoginOtpBlock && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                  Enter your 10-digit mobile number
                </p>
              </div>

              {/* Mobile Input */}
              <div className="space-y-2">
                <div
                  className={`
                    flex items-stretch border-2 rounded-xl overflow-hidden 
                    transition-all duration-200
                    ${loginMobileErr
                      ? 'border-rose-400 dark:border-rose-500 focus-within:ring-rose-200 dark:focus-within:ring-rose-900/30'
                      : 'border-slate-200 dark:border-slate-700 focus-within:border-blue-500'
                    }
                    focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30
                  `}
                >
                  <span className="bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center border-r-2 border-slate-200 dark:border-slate-700 min-w-[56px] justify-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={loginMobileInput}
                    onChange={(e) => setLoginMobileInput(digitsOnly(e.target.value, 10))}
                    onKeyDown={(e) => e.key === 'Enter' && !isGeneratingOtp && onGenerateOtp()}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 text-sm outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    maxLength={10}
                    disabled={isGeneratingOtp}
                    autoFocus
                  />
                  {showLoginOtpBlock && (
                    <span className="flex items-center px-4 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 border-l-2 border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                </div>

                {loginMobileErr && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-500"></span>
                    {loginMobileErr}
                  </p>
                )}
              </div>

              {/* Generate OTP Button */}
              {!showLoginOtpBlock && (
                <Button
                  onClick={onGenerateOtp}
                  className="w-full text-white font-semibold py-3.5 text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ background: 'var(--blue-btn)', borderRadius: "10px" }}
                  disabled={loginMobileInput.length !== 10 || isGeneratingOtp}
                >
                  {isGeneratingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating OTP...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      Generate OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              )}

              {/* OTP Section */}
              {showLoginOtpBlock && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-2 animate-in fade-in slide-in-from-top-3 duration-300">
                  <LoginOtp
                    loginOtpInput={loginOtpInput}
                    setLoginOtpInput={setLoginOtpInput}
                    loginOtpErr={loginOtpErr}
                    isVerifyingOtp={isVerifyingOtp}
                    isGeneratingOtp={isGeneratingOtp}
                    onVerify={onVerifyOtp}
                    onResend={onResendOtp}
                  />
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-8 py-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Secure • Reliable • Trusted Healthcare Platform
          </p>
        </div>
      </div>
    </div>
  )
}

export default PatientLogin