import cors from "cors";
import express from "express";
import ratelimit from "express-rate-limit";
import { ZodError } from "zod";
import { registerApi } from "../routers";
import { initiateErrorHandler } from "./error";

export function createApp() {
    const app = express();

    app.use(
        ratelimit({
            windowMs: 30 * 60 * 1000,
            max: 30,
        })
    );

    app.use(express.json());
    app.use(cors());
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
    code: number;
    message: string;
} {
    if (err instanceof ZodError) {
        return {
            code: 400,
            message: err.errors.map((e) => e.message).join(", "),
        };
    } else if (err instanceof Error) {
        return {
            code: 400,
            message: err.message,
        };
    } else {
        return {
            code: 500,
            message: "Internal server error",
        };
    }
}
