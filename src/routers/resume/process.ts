import { File } from "buffer";
import { exec as execCb } from "child_process";
import fs from "fs";
import { promisify } from "util";
import { Request, Response } from "express";
import multer, { MulterError } from "multer";
import pdfParse from "pdf-parse";
import { utapi } from "../..";
import { generateRandomId, handleError } from "../../utils";
import { fileUploadValidationSchema } from "../../validations";

const exec = promisify(execCb);

const dir = "./uploads";

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: async function (req, file, cb) {
        cb(null, "file_" + generateRandomId());
    },
});

const upload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 512 * 1024, // 512 KB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Invalid file type"));
        }

        cb(null, true);
    },
});

export const resumeProcessRouter = (req: Request, res: Response) => {
    upload.single("file")(req, res, async (err) => {
        if (err) {
            if (err instanceof MulterError) {
                return res.status(400).json({ message: err.message });
            } else {
                return res.status(400).json({ message: err.message });
            }
        }

        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        try {
            const body = req.body;
            const file = req.file;
            const { userId } = fileUploadValidationSchema.parse(body);

            const dataBuffer = fs.readFileSync(file.path);
            const data = await pdfParse(dataBuffer);

            const regex = /[a-zA-Z0-9]/;
            if (!regex.test(data.text))
                return res.status(400).json({ message: "Invalid pdf file" });

            const compressedFilepath =
                file.path + "_" + userId + "_compressed.pdf";
            const command =
                "gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=" +
                compressedFilepath +
                " " +
                file.path;

            try {
                await exec(command);

                const compressedFilename = compressedFilepath.split("\\").pop();

                const compressedFileBuffer =
                    fs.readFileSync(compressedFilepath);
                const compressedFile = new File(
                    [compressedFileBuffer],
                    compressedFilename ?? compressedFilepath,
                    { type: file.mimetype }
                );

                await utapi.uploadFiles([compressedFile], {
                    metadata: {
                        uploaderId: userId,
                    },
                });
            } catch (err) {
                const error = handleError(err);
                return res.status(error.code).json({ message: error.message });
            } finally {
                fs.unlinkSync(compressedFilepath);
            }

            return res.status(200).json({ message: "File processed" });
        } catch (err) {
            const error = handleError(err);
            return res.status(error.code).json({ message: error.message });
        } finally {
            fs.unlinkSync(req.file.path);
        }
    });
};
