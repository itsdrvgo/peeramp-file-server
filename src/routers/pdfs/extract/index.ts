import { readFileSync, unlinkSync } from "fs";
import { Router } from "express";
import PdfParse from "pdf-parse";
import { CResponse, sanitizeError } from "../../../utils";
import { pdfUpload } from "../../../utils/uploads/pdf";
import { uploaderSchema } from "../../../validations";
import { logger ,io} from "../../..";

export function pdfExtractRouter(router: Router) {
    router.post("/extract", pdfUpload.single("file"), async (req, res) => {
        if (!req.file)
            return CResponse({
                res,
                message: "BAD_REQUEST",
                longMessage: "No file uploaded",
            });

        const file = req.file;

        try {
            logger.info("New file uploaded: " + file.originalname);

            const body = req.body;
            const { uploaderId } = uploaderSchema.parse(body);

            io.emit("pdf_extract_progress", {
                progress: 0,
                message: "File processing started...",
            });

            const dataBuffer = readFileSync(file.path);

            io.emit("pdf_extract_progress", {
                progress: 20,
                message: "Validating pdf file...",
            });

            const data = await PdfParse(dataBuffer);

            const regex = /[a-zA-Z0-9]/;
            if (!regex.test(data.text))
                return CResponse({
                    res,
                    message: "BAD_REQUEST",
                    longMessage: "Invalid pdf file",
                });

            io.emit("pdf_extract_progress", {
                progress: 40,
                message: "Extracting text from pdf file...",
            });

            io.emit("pdf_extract_progress", {
                progress: 60,
                message: "Text extracted successfully...",
            });

            logger.info("Text extracted successfully: " + file.originalname);

            return CResponse({
                res,
                message: "OK",
                data: {
                    uploaderId,
                    text: data.text,
                },
            });
        } catch (err) {
            io.emit("pdf_extract_progress", {
                progress: 0,
                message: "Error occurred...",
            });

            const { message } = sanitizeError(err);
            logger.error("Error occurred: " + message);

            return CResponse({
                res,
                message: "ERROR",
                longMessage: message,
            });
        } finally {
            unlinkSync(file.path);
        }
    });
}
