import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import { generateRandomId } from "..";

const dir = "./uploads/image";

if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dir);
    },
    filename: async function (req, file, cb) {
        cb(null, "image_" + generateRandomId());
    },
});

export const imageUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 20, // 20 MB
    },
    fileFilter: function (req, file, cb) {
        if (!["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype))
            return cb(new Error("Only 'png', 'jpg', 'jpeg' files are allowed"));

        cb(null, true);
    },
});
