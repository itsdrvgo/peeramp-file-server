import { z } from "zod";

const ENV_VARS = z.object({
    PORT: z.string().default("3001"),
    UPLOADTHING_SECRET: z.string().min(1),
    UPLOADTHING_APP_ID: z.string().min(1),
});

ENV_VARS.parse(process.env);

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof ENV_VARS> {}
    }
}
