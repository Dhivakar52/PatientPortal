import React from 'react'
import { Button } from '@/components/ui/button'
import { digitsOnly } from '@/utils/patient.utils'
import { KeyRound, ArrowRight, RefreshCw, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface LoginOtpProps {
  loginOtpInput: string
  setLoginOtpInput: (v: string) => void
  loginOtpErr: string
  isVerifyingOtp?: boolean
  isValidatingOtp?: boolean
  isGeneratingOtp?: boolean
  isSendingSms?: boolean
  onVerify: () => void
  onResend: () => void
}

export const LoginOtp: React.FC<LoginOtpProps> = ({
  loginOtpInput,
  setLoginOtpInput,
  loginOtpErr,
  isVerifyingOtp = false,
  isValidatingOtp = false,
  isGeneratingOtp = false,
  isSendingSms = false,
  onVerify,
  onResend,
}) => {
  const isBusyVerifying = isVerifyingOtp || isValidatingOtp
  const isBusyResending = isGeneratingOtp || isSendingSms
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 space-y-4 transition-all duration-300">
      {/* Decorative elements */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-200/20 dark:bg-blue-500/10 rounded-full"></div>
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full"></div>

      {/* Header with icon */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 rounded-xl" style={{ backgroundColor: "var(--blue-text-color)", color: "white" }}>
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Enter OTP
          </label>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Enter the 4-digit code sent to your phone
          </p>
        </div>
      </div>

      {/* OTP Input */}
      <div className="relative z-10">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={loginOtpInput}
            onChange={(e) => setLoginOtpInput(digitsOnly(e.target.value, 4))}
            onKeyDown={(e) => e.key === 'Enter' && loginOtpInput.length === 4 && !isBusyVerifying && onVerify()}
            placeholder="• • • •"
            className="w-full text-center tracking-[8px] text-xl font-bold border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-50"
            maxLength={4}
            disabled={isBusyVerifying}
            autoFocus
          />
        </div>
        {loginOtpErr && (
          <div className="flex items-center gap-1.5 mt-2 animate-in fade-in duration-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{loginOtpErr}</p>
          </div>
        )}
      </div>

      {/* Verify Button */}
      <Button
        onClick={onVerify}
        className="w-full text-white font-semibold cursor-pointer py-5 text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative z-10"
        style={{ background: 'var(--blue-btn)', borderRadius: "4px" }}
        disabled={loginOtpInput.length !== 4 || isBusyVerifying}
      >
        {isBusyVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying OTP...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify OTP
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Resend OTP */}
      <div className="flex items-center justify-center gap-2 relative z-10">
        <button
          type="button"
          onClick={onResend}
          disabled={isBusyResending || isBusyVerifying}
          className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all cursor-pointer bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800/50 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: "var(--blue-text-color)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isBusyResending ? 'animate-spin' : ''}`} />
          {isSendingSms ? 'Sending SMS...' : isGeneratingOtp ? 'Generating OTP...' : 'Resend OTP'}
        </button>
      </div>

      {/* Help text */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center relative z-10">
        Didn't receive the code? Click resend or verify mobile number
      </p>
    </div>
  )
}