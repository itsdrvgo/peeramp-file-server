import { Application, Router } from "express";
import { resumeProcessRouter } from "./resume/process";

export function registerApi(app: Application) {
    const apiRouter = Router();
    app.use("/api", apiRouter);

    const resumeRouter = Router();
    apiRouter.use("/resume", resumeRouter);

    resumeRouter.use(resumeProcessRouter);
}
