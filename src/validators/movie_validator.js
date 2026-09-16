import { z } from "zod";

export const movieQuerySchema = z.object({
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  year: z.coerce.number().int().positive().optional(),
  sort: z.enum(["title", "year"]).default("title"),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});
