import { z } from "zod";

export const uploaderSchema = z.object({
    uploaderId: z.string(),
});

export type UploaderValidator = z.infer<typeof uploaderSchema>;
