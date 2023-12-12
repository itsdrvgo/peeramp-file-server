import chalk from "chalk";

export function initiateErrorHandler() {
    console.log(chalk.cyanBright("[ ✔ ] Error handler initiated..."));

    process.on("uncaughtException", (err) => {
        console.error(
            chalk.redBright(
                "[ ❌ ] Uncaught Exception - " + err.message + "\n" + err.stack
            )
        );
    });

    process.on("unhandledRejection", (reason) => {
        console.error(
            chalk.redBright("[ ❌ ] Unhandled Rejection - " + reason)
        );
    });
}
