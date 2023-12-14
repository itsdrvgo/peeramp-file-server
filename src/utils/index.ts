import cors from "cors";
import express from "express";
import ratelimit from "express-rate-limit";
import { ZodError } from "zod";
import { registerApi } from "../routers";
import { initiateErrorHandler } from "../utils/error";
import { ResponseMessages } from "../validations/response";

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createApp() {
    const app = express();

    app.use(
        ratelimit({
            windowMs: 30 * 60 * 1000,
            max: 30,
        })
    );

    app.use(express.json());
    app.use(
        cors({
            origin: "*",
        })
    );
    app.use(express.urlencoded({ extended: true }));

    registerApi(app);
    initiateErrorHandler();

    return app;
}

export function generateRandomId(length?: number) {
    const alphabet =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const len = length || 10;
    let id = "";

    for (let i = 0; i < len; i++) {
        id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return id;
}

export function sanitizeError(err: unknown): {
    message: string;
} {
    if (err instanceof ZodError) {
        return {
            message: err.errors.map((e) => e.message).join(", "),
        };
    } else if (err instanceof Error) {
        return {
            message: err.message,
        };
    } else {
        return {
            message: "Internal server error",
        };
    }
}

export function CResponse<T>({
    res,
    message,
    longMessage,
    data,
}: {
    res: express.Response;
    message: ResponseMessages;
    longMessage?: string;
    data?: T;
}) {
    let code: number;

    switch (message) {
        case "OK":
            code = 200;
            break;
        case "ERROR":
            code = 400;
            break;
        case "UNAUTHORIZED":
            code = 401;
            break;
        case "FORBIDDEN":
            code = 403;
            break;
        case "NOT_FOUND":
            code = 404;
            break;
        case "BAD_REQUEST":
            code = 400;
            break;
        case "TOO_MANY_REQUESTS":
            code = 429;
            break;
        case "INTERNAL_SERVER_ERROR":
            code = 500;
            break;
        case "SERVICE_UNAVAILABLE":
            code = 503;
            break;
        case "GATEWAY_TIMEOUT":
            code = 504;
            break;
        case "UNKNOWN_ERROR":
            code = 500;
            break;
        case "UNPROCESSABLE_ENTITY":
            code = 422;
            break;
        case "NOT_IMPLEMENTED":
            code = 501;
            break;
        case "CREATED":
            code = 201;
            break;
        case "BAD_GATEWAY":
            code = 502;
            break;
        default:
            code = 500;
            break;
    }

    return res.status(code).json({
        code,
        message,
        longMessage,
        data,
    });
}
