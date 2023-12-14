import { File } from "buffer";
import { readFileSync, unlinkSync } from "fs";
import { Router } from "express";
import sharp from "sharp";
import { io, logger, utapi } from "../../..";
import { CResponse, sanitizeError } from "../../../utils";
import { imageUpload } from "../../../utils/uploads/image";
import { uploaderSchema } from "../../../validations";

export function imageCompressRouter(router: Router) {
    router.post("/compress", imageUpload.array("images"), async (req, res) => {
        if (!req.files || !req.files.length)
            return CResponse({
                res,
                message: "BAD_REQUEST",
                longMessage: "No files uploaded",
            });

        const images = req.files as Express.Multer.File[];

        try {
            logger.info(
                "New file" +
                    (images.length > 1 ? "s" : "") +
                    " uploaded: " +
                    images.map((image) => image.originalname).join(", ")
            );

            const body = req.body;
            const { uploaderId } = uploaderSchema.parse(body);

            io.emit("image_upload_progress", {
                progress: 0,
                message: "File processing started...",
            });

            const compressedImagesFileNames: string[] = [];

            let progress = 0;

            await Promise.all(
                images.map(async (image, index) => {
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

                    progress += 40 / images.length;

                    io.emit("image_upload_progress", {
                        progress,
                        message: "Compressing image " + (index + 1),
                    });
                })
            );

            io.emit("image_upload_progress", {
                progress: 40,
                message: "Starting conversion to file...",
            });

            const compressedImages: File[] = [];

            await Promise.all(
                compressedImagesFileNames.map(async (filename, index) => {
                    const buffer = readFileSync(
                        images[0].destination + "/" + filename + ".jpeg"
                    );

                    const file = new File([buffer], filename, {
                        type: images[0].mimetype,
                        lastModified: Date.now(),
                    });

                    compressedImages.push(file);

                    progress += 40 / images.length;

                    io.emit("image_upload_progress", {
                        progress,
                        message: "Converted image " + (index + 1) + " to file",
                    });
                })
            );

            io.emit("image_upload_progress", {
                progress: 80,
                message: "Uploading files...",
            });

            const uploadedFiles = await utapi.uploadFiles(compressedImages, {
                metadata: {
                    uploaderId,
                },
            });

            uploadedFiles.forEach((uploadedFile) => {
                if (uploadedFile.error) {
                    const { message } = sanitizeError(uploadedFile.error);
                    logger.error("Error while uploading file: " + message);

                    io.emit("image_upload_progress", {
                        progress: 0,
                        message: "Error while uploading file...",
                    });

                    return CResponse({
                        res,
                        message: "ERROR",
                        longMessage: message,
                    });
                }
            });

            await Promise.all(
                compressedImagesFileNames.map(async (filename) => {
                    unlinkSync(
                        images[0].destination + "/" + filename + ".jpeg"
                    );
                })
            );

            io.emit("image_upload_progress", {
                progress: 100,
                message: "File uploaded successfully...",
            });

            return CResponse({
                res,
                message: "OK",
                data: {
                    files: uploadedFiles.map((file) => file.data),
                    uploaderId,
                },
            });
        } catch (err) {
            io.emit("image_upload_progress", {
                progress: 0,
                message: "Error while compressing file...",
            });

            const { message } = sanitizeError(err);
            return CResponse({
                res,
                message: "ERROR",
                longMessage: message,
            });
        } finally {
            await Promise.all(
                images.map(async (image) => {
                    unlinkSync(image.path);
                })
            );
        }
    });
}
