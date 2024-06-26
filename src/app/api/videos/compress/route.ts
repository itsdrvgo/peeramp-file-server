import { readFileSync, unlinkSync } from "fs";
import { Request, Response } from "express";
import ffmpeg from "fluent-ffmpeg";
import { io, logger, utapi } from "../../../..";
import { SOCKET_EVENTS } from "../../../../config/enums";
import { videoUpload } from "../../../../config/uploads/video";
import { CResponse, handleError } from "../../../../utils";
import { uploaderSchema } from "../../../../validations";

export const POST = [
    videoUpload.single("video"),
    async (req: Request, res: Response) => {
        if (!req.file)
            return CResponse({
                res,
                message: "BAD_REQUEST",
                longMessage: "No file uploaded",
            });

        const video = req.file;

        try {
            logger.info("New file uploaded: " + video.originalname);

            const body = req.body;
            const { uploaderId } = uploaderSchema.parse(body);

            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                progress: 0,
                message: "File processing started...",
            });

            const compressedVideoFilename =
                video.filename + "_" + uploaderId + "_c";

            await new Promise<void>((resolve, reject) => {
                ffmpeg.ffprobe(video.path, (err) => {
                    if (err) return reject(err);

                    ffmpeg(video.path)
                        .videoCodec("libx264")
                        .videoBitrate(5000)
                        .audioCodec("aac")
                        .outputOptions([
                            "-preset superfast", // presets: ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, placebo (default: medium) | the slower the preset, the smaller the file size
                            "-crf 30", // Constant Rate Factor (default: 23) | the lower the CRF, the higher the quality | range: 0-51 (0 = lossless, 51 = worst quality)
                            "-profile:v high", // H.264 profile (default: none) | baseline, main, high, high10, high422, high444, high444p10, high444p12 (requires ffmpeg to be compiled with --enable-gpl --enable-libx264)
                            "-level 4.2", // H.264 level (default: none) | 1.0, 1, 1b, 1.1, 1.2, 1.3, 2.0, 2, 2.1, 2.2, 3.0, 3, 3.1, 3.2, 4.0, 4, 4.1, 4.2, 5.0, 5, 5.1, 5.2 (requires ffmpeg to be compiled with --enable-gpl --enable-libx264)
                        ])
                        .on("start", () => {
                            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                                progress: 20,
                                message: "Validating video file...",
                            });
                        })
                        .on("progress", (progress) => {
                            const { percent } = progress;

                            // 20 - 50
                            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                                progress: 20 + percent * 0.3,
                                message: "Compressing video file...",
                            });
                        })
                        .on("error", (err) => {
                            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                                progress: 0,
                                message: "File processing failed...",
                            });

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

            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                progress: 60,
                message: "Conversion to file started...",
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

            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                progress: 80,
                message: "Uploading compressed file...",
            });

            const uploadedFile = await utapi.uploadFiles([compressedVideo], {
                metadata: {
                    uploaderId,
                },
            });

            if (uploadedFile[0].error) {
                io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                    progress: 0,
                    message: "Error while uploading file...",
                });

                return handleError(uploadedFile[0].error, res);
            }

            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                progress: 100,
                message: "File uploaded successfully...",
            });

            logger.info("File uploaded successfully: " + video.originalname);

            unlinkSync(
                video.destination + "/" + compressedVideoFilename + ".mp4"
            );

            return CResponse({
                res,
                message: "OK",
                data: {
                    files: [uploadedFile[0].data],
                    uploaderId,
                },
            });
        } catch (err) {
            io.emit(SOCKET_EVENTS.VIDEO_UPLOAD_PROGRESS, {
                progress: 0,
                message: "Error while compressing file...",
            });

            return handleError(err, res);
        } finally {
            unlinkSync(video.path);
        }
    },
];
