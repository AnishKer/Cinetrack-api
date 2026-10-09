import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(10),
  review_text: z.string().trim().min(1).max(2000),
});
