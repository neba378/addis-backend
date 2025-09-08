import { z } from 'zod';

export const createArbitratorSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  profilePicture: z.string().url('Profile picture must be a valid URL').nullable().optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location must be less than 100 characters'),
  languages: z.union([
    z.array(z.string().min(2, 'Language must be at least 2 characters')),
    z.string().transform((val) => {
      try {
        return JSON.parse(val);
      } catch {
        throw new Error('Invalid languages format');
      }
    })
  ]).refine((val) => Array.isArray(val) && val.length > 0 && val.length <= 10, {
    message: 'At least one language is required, maximum 10 languages allowed'
  }),
  specializationAreas: z.union([
    z.array(z.string().min(2, 'Specialization area must be at least 2 characters')),
    z.string().transform((val) => {
      try {
        return JSON.parse(val);
      } catch {
        throw new Error('Invalid specialization areas format');
      }
    })
  ]).refine((val) => Array.isArray(val) && val.length > 0 && val.length <= 15, {
    message: 'At least one specialization area is required, maximum 15 specialization areas allowed'
  }),
  yearsOfExperience: z.union([
    z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience cannot exceed 50'),
    z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error('Years of experience must be a valid number');
      if (num < 0) throw new Error('Years of experience cannot be negative');
      if (num > 50) throw new Error('Years of experience cannot exceed 50');
      return num;
    })
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
});

export const updateArbitratorSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters').nullable().optional(),
  profilePicture: z.string().url('Profile picture must be a valid URL').nullable().optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location must be less than 100 characters').nullable().optional(),
  languages: z.array(z.string().min(2, 'Language must be at least 2 characters')).min(1, 'At least one language is required').max(10, 'Maximum 10 languages allowed').nullable().optional(),
  specializationAreas: z.array(z.string().min(2, 'Specialization area must be at least 2 characters')).min(1, 'At least one specialization area is required').max(15, 'Maximum 15 specialization areas allowed').nullable().optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience cannot exceed 50').nullable().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters').nullable().optional(),
  isActive: z.boolean().nullable().optional(),
});

export const createArbitrationRequestSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').max(15, 'Phone number must be less than 15 characters'),
  emailAddress: z.string().email('Invalid email address').nullable().optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location must be less than 100 characters').nullable().optional(),
  preferredLanguages: z.array(z.string().min(2, 'Language must be at least 2 characters')).max(10, 'Maximum 10 languages allowed').nullable().optional(),
  typeOfDispute: z.string().min(5, 'Type of dispute must be at least 5 characters').max(100, 'Type of dispute must be less than 100 characters'),
  disputeSummary: z.string().min(20, 'Dispute summary must be at least 20 characters').max(2000, 'Dispute summary must be less than 2000 characters'),
  preferredArbitratorId: z.string().cuid('Invalid arbitrator ID').nullable().optional(),
});

export const updateArbitrationRequestSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).nullable().optional(),
  adminNotes: z.string().max(1000, 'Admin notes must be less than 1000 characters').nullable().optional(),
  preferredArbitratorId: z.string().cuid('Invalid arbitrator ID').nullable().optional(),
});

export const arbitratorIdSchema = z.object({
  id: z.string().cuid('Invalid arbitrator ID'),
});

export const requestIdSchema = z.object({
  id: z.string().cuid('Invalid request ID'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
}); 