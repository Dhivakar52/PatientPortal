import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upcoming Section Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center gap-4">
            {/* Left Date Box */}
            <Skeleton className="w-16 h-16 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-800" />
            {/* Middle info */}
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4.5 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="flex gap-4">
                <Skeleton className="h-3.5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            {/* Right status */}
            <div className="hidden sm:flex flex-col items-end gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Past Visits Section Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-xs"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-4.5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <Skeleton className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
