import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import { generateRandomId } from "..";

const dir = "./uploads/video";

if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    filename: async function (req, file, cb) {
        cb(null, "video_" + generateRandomId());
    },
});

export const videoUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 * 2, // 2 GB
        files: 1,
    },
    fileFilter: function (req, file, cb) {
        if (!["video/mp4", "video/mkv"].includes(file.mimetype))
            return cb(new Error("Only 'mp4', 'mkv' files are allowed"));

        cb(null, true);
    },
});
