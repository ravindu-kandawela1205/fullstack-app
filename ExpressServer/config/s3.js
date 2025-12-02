import { S3Client } from "@aws-sdk/client-s3";
import { application } from './application.js';

export const s3Client = new S3Client({
  region: application.AWS_REGION,
  credentials: {
    accessKeyId: application.AWS_ACCESS_KEY_ID,
    secretAccessKey: application.AWS_SECRET_ACCESS_KEY,
  },
});

export const S3_BUCKET = application.AWS_S3_BUCKET;
