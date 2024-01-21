import { exec as execCb } from "child_process";
import { readFileSync, unlinkSync } from "fs";
import { promisify } from "util";
import { Request, Response } from "express";
import pdfParse from "pdf-parse";
import { io, logger, utapi } from "../../../..";
import { SOCKET_EVENTS } from "../../../../config/enums";
import { pdfUpload } from "../../../../config/uploads/pdf";
import { CResponse, handleError } from "../../../../utils";
import { uploaderSchema } from "../../../../validations";

const exec = promisify(execCb);

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

            io.emit(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS, {
                progress: 0,
                message: "File processing started...",
            });

            const dataBuffer = readFileSync(file.path);

            io.emit(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS, {
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

            io.emit(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS, {
                progress: 40,
                message: "Compressing pdf file...",
            });

            const compressedFilepath =
                file.path + "_" + uploaderId + "_compressed.pdf";

            const isWindows = process.platform === "win32";
            const isMac = process.platform === "darwin";
            const isLinux = process.platform === "linux";

            if (!isWindows && !isMac && !isLinux)
                return CResponse({
                    res,
                    message: "BAD_REQUEST",
                    longMessage: "Unsupported OS",
                });

            const gs = isWindows ? "gswin64c" : "gs";

            const command =
                gs +
                " -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=" +
                compressedFilepath +
                " " +
                file.path;

            try {
                await exec(command);
            } catch (err) {
                return handleError(err, res);
            }

            io.emit(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS, {
                progress: 80,
                message: "Uploading compressed file...",
            });

            const compressedFilename = compressedFilepath.split("\\").pop();

            const compressedFileBuffer = readFileSync(compressedFilepath);
            const compressedFile = new File(
                [compressedFileBuffer],
                compressedFilename ?? compressedFilepath,
                {
                    type: file.mimetype,
                    lastModified: Date.now(),
                }
            );

            const uploadedFiles = await utapi.uploadFiles([compressedFile], {
                metadata: { uploaderId },
            });

            if (uploadedFiles[0].error) {
                io.emit(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS, {
                    progress: 0,
                    message: "Error while uploading file...",
                });

                return handleError(uploadedFiles[0].error, res);
            }

            io.emit(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS, {
                progress: 100,
                message: "File uploaded successfully...",
            });

            logger.info("File uploaded successfully: " + file.originalname);

            unlinkSync(compressedFilepath);

            return CResponse({
                res,
                message: "OK",
                data: {
                    files: [uploadedFiles[0].data],
                    uploaderId,
                },
            });
        } catch (err) {
            io.emit(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS, {
                progress: 0,
                message: "Error while compressing file...",
            });

            return handleError(err, res);
        } finally {
            unlinkSync(file.path);
        }
    },
];
