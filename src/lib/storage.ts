import { getCloudflareContext } from "@opennextjs/cloudflare";

async function getBucket() {
  const context = getCloudflareContext();
  const bucket = context.env._216_storage;

  if (!bucket) {
    throw new Error(
      "R2 bucket binding '_216_storage' not found. Ensure it is defined in wrangler.jsonc.",
    );
  }

  return bucket;
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob | ReadableStream | string,
  contentType?: string,
) {
  const bucket = await getBucket();
  return await bucket.put(key, body, {
    httpMetadata: { contentType },
  });
}

export async function deleteFile(key: string) {
  const bucket = await getBucket();
  return await bucket.delete(key);
}

/**
 * NOTE: For private buckets, use a custom storage proxy API route.
 */
export async function getFileUrl(key: string) {
  return `/api/storage/${key}`;
}

/**
 * @workaround R2Bucket.copy() is supported at runtime but currently missing
 * from official TypeScript definitions. We use get+put to avoid '@ts-ignore'.
 */
export async function copyFile(sourceKey: string, destinationKey: string) {
  const bucket = await getBucket();
  const object = await bucket.get(sourceKey);

  if (!object) {
    throw new Error(`Source object '${sourceKey}' not found in R2.`);
  }

  return await bucket.put(destinationKey, object.body, {
    httpMetadata: object.httpMetadata,
    customMetadata: object.customMetadata,
  });
}

export async function moveFile(sourceKey: string, destinationKey: string) {
  await copyFile(sourceKey, destinationKey);
  await deleteFile(sourceKey);
}

export async function getFile(key: string) {
  const bucket = await getBucket();
  return await bucket.get(key);
}
