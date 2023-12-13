import { File } from "buffer";
import { exec as execCb } from "child_process";
import { readFileSync, unlinkSync } from "fs";
import { promisify } from "util";
import { Router } from "express";
import pdfParse from "pdf-parse";
import { utapi } from "../../..";
import { sanitizeError } from "../../../utils";
import { pdfUpload } from "../../../utils/uploads/pdf";
import { uploaderSchema } from "../../../validations";

const exec = promisify(execCb);

export function pdfCompressionRouter(router: Router) {
    router.post("/compress", pdfUpload.single("file"), async (req, res) => {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        const file = req.file;

        try {
            const body = req.body;
            const { uploaderId } = uploaderSchema.parse(body);

            const dataBuffer = readFileSync(file.path);
            const data = await pdfParse(dataBuffer);

            const regex = /[a-zA-Z0-9]/;
            if (!regex.test(data.text))
                return res.status(400).json({ message: "Invalid pdf file" });

            const compressedFilepath =
                file.path + "_" + uploaderId + "_compressed.pdf";

            const isWindows = process.platform === "win32";
            const isMac = process.platform === "darwin";
            const isLinux = process.platform === "linux";

            if (!isWindows && !isMac && !isLinux)
                return res.status(400).json({ message: "Unsupported OS" });

            const gs = isWindows ? "gswin64c" : "gs";

            const command =
                gs +
                " -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=" +
                compressedFilepath +
                " " +
                file.path;

            try {
                await exec(command);

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

                const uploadedFiles = await utapi.uploadFiles(
                    [compressedFile],
                    {
                        metadata: { uploaderId },
                    }
                );

                return res.status(200).json({
                    message: "File compressed successfully",
                    data: {
                        files: uploadedFiles,
                        uploaderId,
                    },
                });
            } catch (err) {
                const { code, message } = sanitizeError(err);
                return res.status(code).json({ message: message });
            } finally {
                unlinkSync(compressedFilepath);
            }
        } catch (err) {
            const { code, message } = sanitizeError(err);
            return res.status(code).json({ message: message });
        } finally {
            unlinkSync(file.path);
        }
    });
}
