import { readFileSync, unlinkSync } from "fs";
import { Request, Response } from "express";
import pdfParse from "pdf-parse";
import { io, logger } from "../../../..";
import { SOCKET_EVENTS } from "../../../../config/enums";
import { pdfUpload } from "../../../../config/uploads/pdf";
import { CResponse, handleError } from "../../../../utils";
import { uploaderSchema } from "../../../../validations";

export const POST = [
    pdfUpload.single("file"),
    async (req: Request, res: Response) => {
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

            io.emit(SOCKET_EVENTS.PDF_EXTRACT_PROGRESS, {
                progress: 0,
                message: "File processing started...",
            });

            const dataBuffer = readFileSync(file.path);

            io.emit(SOCKET_EVENTS.PDF_EXTRACT_PROGRESS, {
                progress: 20,
                message: "Validating pdf file...",
            });

            const data = await pdfParse(dataBuffer);

            const regex = /[a-zA-Z0-9]/;
            if (!regex.test(data.text))
                return CResponse({
                    res,
                    message: "BAD_REQUEST",
                    longMessage: "Invalid pdf file",
                });

            io.emit(SOCKET_EVENTS.PDF_EXTRACT_PROGRESS, {
                progress: 40,
                message: "Extracting text from pdf file...",
            });

            io.emit(SOCKET_EVENTS.PDF_EXTRACT_PROGRESS, {
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
            io.emit(SOCKET_EVENTS.PDF_EXTRACT_PROGRESS, {
                progress: 0,
                message: "Error occurred...",
            });

            return handleError(err, res);
        } finally {
            unlinkSync(file.path);
        }
    },
];
