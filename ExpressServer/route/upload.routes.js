import { Router } from "express";
import { getPresignedUrl } from "../controllers/upload.controller.js";

const router = Router();

router.get("/test", (req, res) => {
  res.json({ 
    ok: true, 
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
  });
});

router.post("/presigned-url", getPresignedUrl);

export default router;
