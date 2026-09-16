import { z } from "zod";

export const movieQuerySchema = z.object({
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  year: z.coerce.number().int().positive().optional(),
  sort: z.enum(["title", "year"]).default("title"),
  order: z.enum(["asc", "desc"]).default("asc"),
});