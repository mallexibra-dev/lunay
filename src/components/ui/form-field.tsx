'use client';

import React from 'react';
import type { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormFieldProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

export function FormField<T extends FieldValues = FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  containerClassName,
}: FormFieldProps<T>) {
  const error = form.formState.errors[name]?.message;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <label
        htmlFor={name}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          error && 'text-destructive'
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...form.register(name)}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
      {error && (
        <p className="text-sm font-medium text-destructive">{String(error)}</p>
      )}
    </div>
  );
}

interface FormTextAreaProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
  containerClassName?: string;
}

export function FormTextArea<T extends FieldValues = FieldValues>({
  form,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  className,
  containerClassName,
}: FormTextAreaProps<T>) {
  const error = form.formState.errors[name]?.message;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <label
        htmlFor={name}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          error && 'text-destructive'
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...form.register(name)}
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
      {error && (
        <p className="text-sm font-medium text-destructive">{String(error)}</p>
      )}
    </div>
  );
}