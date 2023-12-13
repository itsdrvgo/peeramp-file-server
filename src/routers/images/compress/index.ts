import { File } from "buffer";
import { readFileSync, unlinkSync } from "fs";
import { Router } from "express";
import sharp from "sharp";
import { utapi } from "../../..";
import { sanitizeError } from "../../../utils";
import { imageUpload } from "../../../utils/uploads/image";
import { uploaderSchema } from "../../../validations";

export function imageCompressRouter(router: Router) {
    router.post("/compress", imageUpload.array("images"), async (req, res) => {
        if (!req.files || !req.files.length)
            return res.status(400).json({ message: "No file uploaded" });

        const images = req.files as Express.Multer.File[];

        try {
            const body = req.body;
            const { uploaderId } = uploaderSchema.parse(body);

            const compressedImagesFileNames: string[] = [];

            await Promise.all(
                images.map(async (image) => {
                    const compressedImageFilename =
                        image.filename + "_" + uploaderId + "_c";

                    await sharp(image.path)
                        .resize(720)
                        .jpeg({ quality: 75 })
                        .toFile(
                            image.destination +
                                "/" +
                                compressedImageFilename +
                                ".jpeg"
                        );

                    compressedImagesFileNames.push(compressedImageFilename);
                })
            );

            const compressedImages: File[] = [];

            await Promise.all(
                compressedImagesFileNames.map(async (filename) => {
                    const buffer = readFileSync(
                        images[0].destination + "/" + filename + ".jpeg"
                    );

                    const file = new File([buffer], filename, {
                        type: images[0].mimetype,
                        lastModified: Date.now(),
                    });

                    compressedImages.push(file);
                })
            );

            const uploadedFiles = await utapi.uploadFiles(compressedImages, {
                metadata: {
                    uploaderId,
                },
            });

            await Promise.all(
                compressedImagesFileNames.map(async (filename) => {
                    unlinkSync(
                        images[0].destination + "/" + filename + ".jpeg"
                    );
                })
            );

            return res.status(200).json({
                message: "Images compressed successfully",
                data: {
                    files: uploadedFiles,
                    uploaderId,
                },
            });
        } catch (err) {
            const { code, message } = sanitizeError(err);
            return res.status(code).json({ message });
        } finally {
            await Promise.all(
                images.map(async (image) => {
                    unlinkSync(image.path);
                })
            );
        }
    });
}
