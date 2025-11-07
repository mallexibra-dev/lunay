import { email, minLength, object, string, pipe, regex } from 'valibot';

// Email validation schema
export const emailSchema = pipe(
  string('Email is required'),
  email('Invalid email address')
);

// Password validation schema
export const passwordSchema = pipe(
  string('Password is required'),
  minLength(8, 'Password must be at least 8 characters long'),
  regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )
);

// Sign In form schema
export const signInSchema = object({
  email: emailSchema,
  password: string('Password is required'),
});

// Sign Up form schema
export const signUpSchema = object({
  name: pipe(
    string('Name is required'),
    minLength(2, 'Name must be at least 2 characters long'),
    regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  ),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: string('Please confirm your password'),
});

// Password reset request schema
export const forgotPasswordSchema = object({
  email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = object({
  password: passwordSchema,
  confirmPassword: string('Please confirm your password'),
});

// Change password schema (includes current password)
export const changePasswordSchema = object({
  currentPassword: string('Current password is required'),
  password: passwordSchema,
  confirmPassword: string('Please confirm your password'),
});