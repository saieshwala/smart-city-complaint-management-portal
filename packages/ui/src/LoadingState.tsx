import React from 'react';
import { cn } from './utils';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
