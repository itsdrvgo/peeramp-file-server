import path from "path";
import BP from "body-parser";
import cors from "cors";
import express from "express";
import { createRouter } from "./nextress";
import { initiateErrorHandler } from "./utils";

export function createApp() {
    const app = express();

    app.use(BP.urlencoded({ extended: false }));
    app.use(BP.json());
    app.use(cors());

    createRouter(app, {
        directory: path.join(__dirname, "app"),
    });
    initiateErrorHandler();

    return app;
}
