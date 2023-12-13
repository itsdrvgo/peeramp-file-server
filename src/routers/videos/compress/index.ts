import { File } from "buffer";
import { readFileSync, unlinkSync } from "fs";
import { Router } from "express";
import ffmpeg from "fluent-ffmpeg";
import { utapi } from "../../..";
import { sanitizeError } from "../../../utils";
import { videoUpload } from "../../../utils/uploads/video";
import { uploaderSchema } from "../../../validations";

export function videoCompressRouter(router: Router) {
    router.post("/compress", videoUpload.single("video"), async (req, res) => {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        const video = req.file;

        try {
            const body = req.body;
            const { uploaderId } = uploaderSchema.parse(body);

            const compressedVideoFilename =
                video.filename + "_" + uploaderId + "_c";

            await new Promise<void>((resolve, reject) => {
                ffmpeg.ffprobe(video.path, (err) => {
                    if (err) {
                        return res.status(400).json({ message: err.message });
                    }

                    ffmpeg(video.path)
                        .videoCodec("libx264")
                        .videoBitrate(5000)
                        .audioCodec("aac")
                        .outputOptions([
                            "-preset superfast",
                            "-crf 30",
                            "-profile:v high", // H.264 profile
                            "-level 4.2", // H.264 level
                        ])

                        // TODO: Add progress event
                        .on("progress", () => {})

                        .on("error", (err) => {
                            reject(err);
                        })
                        .on("end", () => {
                            resolve();
                        })
                        .save(
                            video.destination +
                                "/" +
                                compressedVideoFilename +
                                ".mp4"
                        );
                });
            });

            const compressedVideoBuffer = readFileSync(
                video.destination + "/" + compressedVideoFilename + ".mp4"
            );

            const compressedVideo = new File(
                [compressedVideoBuffer],
                compressedVideoFilename,
                {
                    type: video.mimetype,
                    lastModified: Date.now(),
                }
            );

            const uploadedFile = await utapi.uploadFiles([compressedVideo], {
                metadata: {
                    uploaderId,
                },
            });

            unlinkSync(
                video.destination + "/" + compressedVideoFilename + ".mp4"
            );

            return res.status(200).json({
                message: "Video compressed successfully",
                data: {
                    file: uploadedFile,
                    uploaderId,
                },
            });
        } catch (err) {
            const { code, message } = sanitizeError(err);
            return res.status(code).json({ message });
        } finally {
            unlinkSync(video.path);
        }
    });
}
