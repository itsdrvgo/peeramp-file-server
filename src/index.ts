import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { UTApi } from "uploadthing/server";
import { Logger } from "./classes/logger";
import { createApp } from "./utils";

dotenv.config();

export const logger = new Logger();
export const utapi = new UTApi();

const app = createApp();

const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    logger.info("Socket connected: " + socket.id);
    logger.info("Current sockets: " + io.sockets.sockets.size);

    socket.on("disconnect", () => {
        logger.info("Socket disconnected: " + socket.id);
        logger.info("Current sockets: " + io.sockets.sockets.size);
    });

    socket.on("error", (err) => {
        logger.error("Socket error: " + err.message);
    });
});

server.listen(process.env.PORT, () => {
    logger.info("File server started on port " + process.env.PORT);
});
