import { logger } from "../index";

export function initiateErrorHandler() {
    logger.info("Error handler initiated");

    process.on("uncaughtException", (err) => {
        logger.error("Uncaught Exception - " + err.message + "\n" + err.stack);
    });

    process.on("unhandledRejection", (reason) => {
        logger.error("Unhandled Rejection - " + reason);
    });
}
