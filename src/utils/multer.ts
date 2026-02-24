import { Options, diskStorage } from 'multer';
import path, { resolve } from 'path';
import multerS3 from 'multer-s3';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { MEGABYTE_IN_BYTE } from '../constants/constants';


const s3 = new S3Client({
  region: process.env.AWS_REGION, // Replace with your region
  credentials: {
    accessKeyId:process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
}); // Replace with your region

const multerS3Config = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME, // Replace with your S3 bucket name
  contentType: function (req, file, cb) {
    cb(null, file.mimetype);
  },
  key: function (req, file, cb) {
    const filename = path.parse(file.originalname).name +
      '_' +
      Date.now() +
      '_' +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, filename);
  },
});

export const multerConfig = {
  storage: multerS3Config,
  limits: {
    fileSize: 100 * 100000000000000000000000000000000000000000000000000000000000000000000000000000, // Adjust file size limit
  },
};