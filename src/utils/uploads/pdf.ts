import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import { generateRandomId } from "..";

const dir = "./uploads/pdf";

if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    filename: async function (req, file, cb) {
        cb(null, "file_" + generateRandomId());
    },
});

export const pdfUpload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 1024 * 1024 * 10, // 10 MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "application/pdf")
            return cb(new Error("Only 'pdf' files are allowed"));

        cb(null, true);
    },
});
