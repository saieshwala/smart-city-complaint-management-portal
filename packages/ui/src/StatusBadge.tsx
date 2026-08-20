import React from 'react';
import { cn } from './utils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  ANALYZING: { label: 'Analyzing', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  AWAITING_USER_CONFIRMATION: { label: 'Awaiting Confirmation', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  READY_TO_SUBMIT: { label: 'Ready to Submit', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  RECEIVED: { label: 'Received', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  UNDER_REVIEW: { label: 'Under Review', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  ASSIGNED: { label: 'Assigned', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  NEEDS_INFORMATION: { label: 'Needs Information', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-50 text-green-700 border-green-200' },
  CLOSED: { label: 'Closed', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  DUPLICATE: { label: 'Duplicate', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  FAILED_SUBMISSION: { label: 'Submission Failed', className: 'bg-red-50 text-red-700 border-red-200' },
};

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.className,
        sizeClasses[size],
        className,
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        config.className.includes('green') ? 'bg-green-500' :
        config.className.includes('blue') ? 'bg-blue-500' :
        config.className.includes('amber') ? 'bg-amber-500' :
        config.className.includes('red') ? 'bg-red-500' :
        config.className.includes('purple') ? 'bg-purple-500' :
        config.className.includes('indigo') ? 'bg-indigo-500' :
        config.className.includes('cyan') ? 'bg-cyan-500' :
        config.className.includes('orange') ? 'bg-orange-500' :
        'bg-gray-400'
      )} />
      {config.label}
    </span>
  );
}
