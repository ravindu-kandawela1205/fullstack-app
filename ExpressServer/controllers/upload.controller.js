import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

export const getPresignedUrl = async (req, res) => {
  try {
    console.log("Presigned URL request:", req.body);
    console.log("AWS Config:", {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY?.substring(0, 10) + '...'
    });
    const { fileName, fileType } = req.body;
    
    const bucket = process.env.AWS_S3_BUCKET;
    
    if (!bucket) {
      console.error("S3_BUCKET not configured");
      return res.status(500).json({ error: "S3 bucket not configured" });
    }
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    const key = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${fileName}`;
    console.log("Generating presigned URL for:", { bucket, key, fileType });
    
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    console.log("Presigned URL generated successfully");
    
    res.json({
      uploadUrl: url,
      fileUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("S3 Upload Error Details:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ error: error.message, code: error.code });
  }
};
