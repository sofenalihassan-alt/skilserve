import { z } from 'zod';

// Authentication validation schemas
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(1, 'Password required')
});

export const signupSchema = z.object({
  email: z.string().trim().email('Invalid email format').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  fullName: z.string().trim()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),
  phone: z.string().trim().optional()
    .refine(val => !val || /^\+?[0-9]{10,15}$/.test(val), 'Invalid phone number format')
});

// Provider registration validation schema
export const providerSchema = z.object({
  businessName: z.string().trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name too long'),
  hourlyRate: z.number()
    .positive('Hourly rate must be positive')
    .max(10000, 'Hourly rate seems unrealistic'),
  yearsExperience: z.number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience seems unrealistic'),
  bio: z.string().trim()
    .max(500, 'Bio too long (maximum 500 characters)'),
  licenseNumber: z.string().trim().optional()
    .refine(val => !val || /^[A-Z0-9-]+$/i.test(val), 'Invalid license format'),
  specialization: z.string().trim()
    .max(200, 'Specialization description too long')
});

// Message validation schema
export const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long (maximum 1000 characters)')
    .refine(
      val => !/<script|javascript:|on\w+=/i.test(val),
      'Message contains invalid content'
    )
});

// Safe error message mapper to avoid exposing database details
export const getSafeErrorMessage = (error: any): string => {
  const message = error?.message?.toLowerCase() || '';
  
  // Map common database errors to user-friendly messages
  if (message.includes('unique') || message.includes('duplicate')) {
    if (message.includes('email')) {
      return 'An account with this email already exists';
    }
    if (message.includes('user_id')) {
      return 'You have already registered as a provider';
    }
    return 'This information is already in use';
  }
  
  if (message.includes('foreign key') || message.includes('violates')) {
    return 'Invalid data provided. Please check your information';
  }
  
  if (message.includes('invalid') && message.includes('credentials')) {
    return 'Invalid email or password';
  }
  
  if (message.includes('not found')) {
    return 'Account not found';
  }
  
  if (message.includes('network') || message.includes('timeout')) {
    return 'Network error. Please check your connection and try again';
  }
  
  // Generic safe message for unknown errors
  return 'An error occurred. Please try again later';
};

// Profile update validation schema
export const profileUpdateSchema = z.object({
  full_name: z.string().trim()
    .min(1, 'Name is required')
    .max(100, 'Name too long (maximum 100 characters)'),
  phone: z.string().trim().optional()
    .refine(val => !val || /^\+?[0-9]{10,15}$/.test(val), 'Invalid phone number format'),
  avatar_url: z.string().optional()
    .refine(val => !val || val.length === 0 || /^https?:\/\/.+/.test(val), 'Invalid URL format'),
  address: z.string().trim().max(200, 'Address too long').optional(),
  city: z.string().trim().max(100, 'City name too long').optional(),
  state: z.string().trim().max(100, 'State name too long').optional(),
  zip_code: z.string().trim()
    .refine(val => !val || /^[A-Z0-9- ]{2,20}$/i.test(val), 'Invalid ZIP code format')
    .optional()
});
