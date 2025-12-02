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
];

export const isR2Configured = () =>
  requiredEnv.every((key) => Boolean(process.env[key]));

const endpoint = process.env.CLOUDFLARE_R2_PUBLIC_BASE || undefined;

const client = new S3Client({
  region: process.env.CLOUDFLARE_R2_REGION || 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

const bucket = process.env.CLOUDFLARE_R2_BOOK_BUCKET;
const defaultExpiresIn = 3600; // 60 minutes

export const createUploadUrl = async ({
  key,
  contentType,
  contentLength,
  expiresIn = defaultExpiresIn,
}) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  return uploadUrl;
};

export const createReadUrl = async ({
  key,
  expiresIn = defaultExpiresIn,
  downloadName,
}) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: downloadName
      ? `attachment; filename="${downloadName}"`
      : undefined,
  });
  const signedUrl = await getSignedUrl(client, command, { expiresIn });
  return signedUrl;
};

export const deleteObject = async ({ key }) => {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await client.send(command);
};
