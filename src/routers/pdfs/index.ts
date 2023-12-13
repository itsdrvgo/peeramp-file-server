import { Router } from "express";
import { pdfCompressionRouter } from "./compress";
import { pdfExtractRouter } from "./extract";

export function pdfRouter(router: Router) {
    const pdfRouter = Router();
    pdfCompressionRouter(pdfRouter);
    pdfExtractRouter(pdfRouter);
    router.use("/pdfs", pdfRouter);
}
