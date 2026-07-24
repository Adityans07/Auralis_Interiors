import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

export const adminProductSchema = z.object({
  name: z.string().trim().min(2),
  slug: slugSchema,
  category: z.string().trim().min(2),
  subcategory: z.string().optional().or(z.literal("")),
  description: z.string().trim().min(10),
  price: z.coerce.number().positive("Price must be positive."),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  imageUrl: z.string().min(1, "Please upload an image."),
  brand: z.string().optional().or(z.literal("")),
  material: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  styleTags: z.string().optional(),
  itemType: z.string().trim().min(2),
  roomTypes: z.string().min(1, "Room types required."),
  designTypes: z.string().min(1, "Design types required."),
  city: z.string().trim().min(2),
  state: z.string().optional().or(z.literal("")),
  country: z.string().trim().min(2),
  postalCode: z.string().optional().or(z.literal("")),
  stockStatus: z.enum(["IN_STOCK", "LIMITED", "OUT_OF_STOCK"]),
  vendorName: z.string().trim().min(2, "Vendor name is required."),
  vendorUrl: z.string().url().optional().or(z.literal("")),
});

export type AdminProductSchema = z.infer<typeof adminProductSchema>;

export const adminBlogSchema = z.object({
  title: z.string().trim().min(2),
  slug: slugSchema,
  excerpt: z.string().trim().min(10),
  content: z.string().trim().min(20),
  coverImageUrl: z.string().url("Enter a valid image URL."),
  authorName: z.string().trim().min(2),
  category: z.string().trim().min(2),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

export type AdminBlogSchema = z.infer<typeof adminBlogSchema>;
