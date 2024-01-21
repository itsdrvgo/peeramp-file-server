import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import { generateId } from "../../utils";

const dir = "./uploads/pdf";

if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, dir);
    },
    filename: (_, __, cb) => {
        cb(null, "file_" + generateId());
    },
});

export const pdfUpload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 1024 * 1024 * 10, // 10 MB
    },
    fileFilter: (_, file, cb) => {
        if (file.mimetype !== "application/pdf")
            return cb(new Error("Only 'pdf' files are allowed"));

        cb(null, true);
    },
});
