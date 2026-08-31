import React from 'react'
import srmLogo from '@/assets/images/srm_logo.png'

interface PageLoaderProps {
  message?: string
  subMessage?: string
  fullScreen?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  subMessage = 'Your information is being securely prepared',
  fullScreen = true,
  className = '',
  size = 'md',
}) => {
  const containerHeight = fullScreen ? 'min-h-screen' : 'min-h-[350px] h-full'

  // Dimensions based on size
  const ringSize = size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-24 h-24' : 'w-18 h-18'
  const logoSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'

  return (
    <div
      className={`
        w-full ${containerHeight} flex flex-col items-center justify-center p-6
        bg-gradient-to-br from-blue-50/40 via-white to-slate-50/50 
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
        text-slate-800 dark:text-slate-100 font-sans transition-all duration-300
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-4">
        {/* Animated Medical Circular Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Glowing Halo */}
          <div className={`${ringSize} absolute rounded-full bg-blue-500/10 dark:bg-blue-400/10 blur-md animate-pulse`} />

          {/* Background Fixed Ring */}
          <div
            className={`
              ${ringSize} rounded-full border-2 
              border-slate-200/80 dark:border-slate-800 
            `}
          />

          {/* Smooth Rotating Healthcare Arc */}
          <div
            className={`
              ${ringSize} absolute rounded-full border-2 border-transparent 
              border-t-blue-600 border-r-blue-600/40 dark:border-t-blue-400 dark:border-r-blue-400/30
              animate-spin
            `}
            style={{ animationDuration: '1.2s' }}
          />

          {/* Center Medical Logo / Icon Badge */}
          <div
            className="absolute flex items-center justify-center rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-xs border border-slate-100 dark:border-slate-800 shrink-0"
          >
            <img
              src={srmLogo}
              alt="SRM Hospital"
              width={36}
              height={36}
              className={`${logoSize} object-contain`}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-1 pt-1">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wide flex items-center justify-center gap-1.5">
            <span>{message}</span>
            {/* Subtle animated dot pulse */}
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </h2>

          {subMessage && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-xs">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageLoader
