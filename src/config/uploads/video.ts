import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import { generateId } from "../../utils";

const dir = "./uploads/video";

if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, dir);
    },
    filename: (_, __, cb) => {
        cb(null, "video_" + generateId());
    },
});

export const videoUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 * 2, // 2 GB
        files: 1,
    },
    fileFilter: (_, file, cb) => {
        if (!["video/mp4", "video/mkv"].includes(file.mimetype))
            return cb(new Error("Only 'mp4', 'mkv' files are allowed"));

        cb(null, true);
    },
});
