import { createServer } from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { UTApi } from "uploadthing/server";
import { createApp } from "./app";
import { SOCKET_EVENTS } from "./config/enums";
import { Logger } from "./config/logger";

const DEFAULT_PORT = 3001;

dotenv.config();

const logger = new Logger();
const utapi = new UTApi();
const app = createApp();

const port = process.env.PORT ?? DEFAULT_PORT;

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info("Socket connected: " + socket.id);
    logger.info("Total sockets: " + io.sockets.sockets.size);

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        logger.info("Socket disconnected: " + socket.id);
        logger.info("Total sockets: " + io.sockets.sockets.size);
    });

    socket.on(SOCKET_EVENTS.ERROR, (err) => {
        logger.error("Socket error: " + err.message);
    });
});

server.listen(port, () => {
    logger.info("Server started on port " + port);
});

export { app, logger, utapi, io };
