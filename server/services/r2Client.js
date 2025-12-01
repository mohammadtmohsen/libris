import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const requiredEnv = [
  'CLOUDFLARE_R2_ACCOUNT_ID',
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'CLOUDFLARE_R2_BOOK_BUCKET',
  'CLOUDFLARE_R2_COVER_BUCKET',
];

export const isR2Configured = () => requiredEnv.every((key) => Boolean(process.env[key]));

const endpoint = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  ? `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : undefined;

const client = new S3Client({
  region: process.env.CLOUDFLARE_R2_REGION || 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export const buckets = {
  book: process.env.CLOUDFLARE_R2_BOOK_BUCKET,
  cover: process.env.CLOUDFLARE_R2_COVER_BUCKET,
};

const defaultExpiresIn = 3600; // 60 minutes

const requireBucket = (bucket) => {
  if (!bucket) {
    throw new Error('Storage bucket is required');
  }
  return bucket;
};

export const createUploadUrl = async ({
  key,
  bucket,
  contentType,
  contentLength,
  expiresIn = defaultExpiresIn,
}) => {
  const targetBucket = requireBucket(bucket);
  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  return uploadUrl;
};

export const createReadUrl = async ({
  key,
  bucket,
  expiresIn = defaultExpiresIn,
  downloadName,
}) => {
  const targetBucket = requireBucket(bucket);
  const command = new GetObjectCommand({
    Bucket: targetBucket,
    Key: key,
    ResponseContentDisposition: downloadName ? `attachment; filename="${downloadName}"` : undefined,
  });
  const signedUrl = await getSignedUrl(client, command, { expiresIn });
  return signedUrl;
};

export const deleteObject = async ({ key, bucket }) => {
  const targetBucket = requireBucket(bucket);
  const command = new DeleteObjectCommand({ Bucket: targetBucket, Key: key });
  await client.send(command);
};
