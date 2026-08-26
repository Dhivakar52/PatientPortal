import React from 'react';
import { cn } from '@/lib/utils';

interface StatusProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border?: string; label: string }> = {
  active: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', border: 'border border-emerald-200 dark:border-emerald-800', label: 'Active' },
  visited: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', border: 'border border-emerald-200 dark:border-emerald-800', label: 'Visited' },
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', border: 'border border-emerald-200 dark:border-emerald-800', label: 'Completed' },
  scheduled: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', border: 'border border-blue-200 dark:border-blue-800', label: 'Scheduled' },
  upcoming: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', border: 'border border-blue-200 dark:border-blue-800', label: 'Upcoming' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', border: 'border border-blue-200 dark:border-blue-800', label: 'Confirmed' },
  pending: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', border: 'border border-amber-200 dark:border-amber-800', label: 'Pending' },
  cancelled: { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', border: 'border border-rose-200 dark:border-rose-800', label: 'Cancelled' },
  canceled: { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', border: 'border border-rose-200 dark:border-rose-800', label: 'Cancelled' },
  'not visited': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border border-slate-200 dark:border-slate-700', label: 'Not Visited' },
  'in-progress': { bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-800 dark:text-cyan-300', border: 'border border-cyan-200 dark:border-cyan-800', label: 'In Progress' },
  'no-show': { bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-800 dark:text-orange-300', border: 'border border-orange-200 dark:border-orange-800', label: 'No Show' },
  rescheduled: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', border: 'border border-amber-200 dark:border-amber-800', label: 'Rescheduled' },
  arrived: { bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-800 dark:text-teal-300', border: 'border border-teal-200 dark:border-teal-800', label: 'Arrived' },
  discharged: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', border: 'border border-emerald-200 dark:border-emerald-800', label: 'Discharged' },
  admitted: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', border: 'border border-blue-200 dark:border-blue-800', label: 'Admitted' },
  critical: { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', border: 'border border-rose-200 dark:border-rose-800', label: 'Critical' },
  stable: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', border: 'border border-emerald-200 dark:border-emerald-800', label: 'Stable' },
};

export const Status: React.FC<StatusProps> = ({ 
  status, 
  size = 'md', 
  className = '',
  showLabel = true,
}) => {
  const config = STATUS_CONFIG[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    label: status 
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-0.5',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(
      'inline-flex rounded-[4px] items-center font-medium text-[12px]',
      config.bg,
      config.text,
      config.border,
      sizeClasses[size],
      className
    )}>
      {showLabel && config.label}
    </span>
  );
};

export default Status;