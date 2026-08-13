import React from 'react';
import { cn } from '@/lib/utils';

interface StatusProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  scheduled: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Scheduled' },
  'in-progress': { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'In Progress' },
  'no-show': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'No Show' },
  rescheduled: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Rescheduled' },
  confirmed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Confirmed' },
  arrived: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Arrived' },
  discharged: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Discharged' },
  admitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Admitted' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
  stable: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Stable' },
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
      sizeClasses[size],
      className
    )}>
      {showLabel && config.label}
    </span>
  );
};

export default Status;