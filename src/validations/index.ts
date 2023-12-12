import { z } from "zod";

export const fileUploadValidationSchema = z.object({
    userId: z.string(),
});

export type FileUploadValidationSchema = z.infer<
    typeof fileUploadValidationSchema
>;
