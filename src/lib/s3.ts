import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const bucketName = process.env.S3_BUCKET_NAME!;

/**
 * Uploads a file to S3/R2
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType?: string,
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await s3Client.send(command);
}

/**
 * Deletes a file from S3/R2
 */
export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await s3Client.send(command);
}

/**
 * Gets a signed URL for a file (useful if the bucket is private)
 */
export async function getFileUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Copies a file from one key to another within the same bucket
 */
export async function copyFile(sourceKey: string, destinationKey: string) {
  const command = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${sourceKey}`,
    Key: destinationKey,
  });

  return await s3Client.send(command);
}

/**
 * Moves a file by copying then deleting
 */
export async function moveFile(sourceKey: string, destinationKey: string) {
  await copyFile(sourceKey, destinationKey);
  await deleteFile(sourceKey);
}

export { s3Client };
