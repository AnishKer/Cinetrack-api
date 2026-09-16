import {z} from "zod";

export const updateWatchlistSchema = z.object ({
    status: z.enum(["planned","watched"])
})