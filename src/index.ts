import chalk from "chalk";
import dotenv from "dotenv";
import { UTApi } from "uploadthing/server";
import { createApp } from "./utils";

dotenv.config();

const app = createApp();

export const utapi = new UTApi();

app.listen(process.env.PORT, () => {
    console.log(
        chalk.cyanBright("[ ✔ ] Server started on port - " + process.env.PORT)
    );
});
