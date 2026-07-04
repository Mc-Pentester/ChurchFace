import { z } from "zod";

export const createChurchSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(3),
  description: z.string().optional(),
  slogan: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const createPostSchema = z.object({
  churchId: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const createEventSchema = z.object({
  churchId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  location: z.string().optional(),
});
