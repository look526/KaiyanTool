import React from 'react';
import { cn } from '../../design-system';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  glass?: boolean;
}

export function Textarea({ label, error, glass = true, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-semibold text-primary-900 dark:text-primary-100">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full min-h-36 p-4 rounded-md border text-sm text-primary-900 dark:text-primary-100 resize-vertical font-sans outline-none transition-all duration-300',
          glass 
            ? 'bg-white/5 dark:bg-gray-900/5 border-white/10 dark:border-gray-800 backdrop-blur-md' 
            : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
            : 'focus:border-primary-500 focus:ring-primary-500/20 hover:border-gray-400 dark:hover:border-gray-600',
          className
        )}
        {...props}
      />
      {error && (
        <span className="block mt-1.5 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
