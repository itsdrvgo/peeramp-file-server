import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import { generateId } from "../../utils";

const dir = "./uploads/image";

if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, dir);
    },
    filename: (_, __, cb) => {
        cb(null, "image_" + generateId());
    },
});

export const imageUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 20, // 20 MB
    },
    fileFilter: (_, file, cb) => {
        if (!["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype))
            return cb(new Error("Only 'png', 'jpg', 'jpeg' files are allowed"));

        cb(null, true);
    },
});
