import { Application, Router } from "express";
import { imageRouter } from "./images";
import { pdfRouter } from "./pdfs";
import { videoRouter } from "./videos";

export function registerApi(app: Application) {
    const apiRouter = Router();
    pdfRouter(apiRouter);
    imageRouter(apiRouter);
    videoRouter(apiRouter);
    app.use("/api", apiRouter);
}
