import { z } from "zod";

const urlSchema = z.string().url().refine(
  (url) => url.startsWith('http://') || url.startsWith('https://'),
  "Only HTTP/HTTPS URLs allowed"
);

export const createChurchSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  slogan: z.string().max(200).optional(),
  logo: urlSchema.optional(),
  coverImage: urlSchema.optional(),
  website: urlSchema.optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export const createPostSchema = z.object({
  churchId: z.string().min(1),
  content: z.string().min(1).max(10000),
  imageUrl: urlSchema.optional(),
  videoUrl: urlSchema.optional(),
});

export const createEventSchema = z.object({
  churchId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  location: z.string().max(200).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  image: urlSchema.optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  postId: z.string().min(1),
  parentId: z.string().optional(),
});

export const createPrayerSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  category: z.string().min(1),
  isUrgent: z.boolean().optional(),
});
