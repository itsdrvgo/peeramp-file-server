import { readFileSync, unlinkSync } from "fs";
import { Router } from "express";
import PdfParse from "pdf-parse";
import { sanitizeError } from "../../../utils";
import { pdfUpload } from "../../../utils/uploads/pdf";
import { uploaderSchema } from "../../../validations";

export function pdfExtractRouter(router: Router) {
    router.post("/extract", pdfUpload.single("file"), async (req, res) => {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        const file = req.file;

        try {
            const body = req.body;
            const { uploaderId } = uploaderSchema.parse(body);

            const dataBuffer = readFileSync(file.path);
            const data = await PdfParse(dataBuffer);

            const regex = /[a-zA-Z0-9]/;
            if (!regex.test(data.text))
                return res.status(400).json({ message: "Invalid pdf file" });

            return res.status(200).json({
                message: "Success",
                data: {
                    uploaderId,
                    text: data.text,
                },
            });
        } catch (err) {
            const { code, message } = sanitizeError(err);
            return res.status(code).json({ message });
        } finally {
            unlinkSync(file.path);
        }
    });
}
