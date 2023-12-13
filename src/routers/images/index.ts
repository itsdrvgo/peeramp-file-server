import { Router } from "express";
import { imageCompressRouter } from "./compress";

export function imageRouter(router: Router) {
    const imageRouter = Router();
    imageCompressRouter(imageRouter);
    router.use("/images", imageRouter);
}
