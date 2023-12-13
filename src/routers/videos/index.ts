import { Router } from "express";
import { videoCompressRouter } from "./compress";

export function videoRouter(router: Router) {
    const videoRouter = Router();
    videoCompressRouter(videoRouter);
    router.use("/videos", videoRouter);
}
