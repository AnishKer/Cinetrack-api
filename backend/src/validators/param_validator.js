import { z } from "zod";

export const movieIdParamSchema = z.object({
  movieId: z.coerce.number().int().positive(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
