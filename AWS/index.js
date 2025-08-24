/**
 * Lambda Function: S3 Image Optimizer
 *
 * Triggered by S3 upload events, this function:
 * - Checks if the uploaded image has already been optimized.
 * - Resizes and compresses images larger than 1MB to fit within size constraints.
 * - Overwrites the original file in S3 with the optimized version.
 * - Sets a custom metadata flag to avoid reprocessing.
 */


const { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require('sharp');

const s3 = new S3Client({ region: "eu-north-1" });

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const maxSize = 1 * 1024 * 1024; // 1 MB

  try {

    const metadataParams = new HeadObjectCommand({ Bucket: bucket, Key: key });
    const metadata = await s3.send(metadataParams);

    if (metadata.Metadata?.optimized === 'true') {
      console.log(`Imagem ${key} has already been optimized, skipping.`);
      return { status: 'Image already optimized, skipped' };
    }

    const params = new GetObjectCommand({ Bucket: bucket, Key: key });
    const { Body } = await s3.send(params);

    let quality = 90;
    let resizedImage = sharp(await Body.transformToByteArray())
      .rotate()
      .resize({ width: 1920, fit: 'inside' });


    let outputBuffer;
    do {
      outputBuffer = await resizedImage.jpeg({ quality: quality }).toBuffer();
      quality -= 10;
    } while (outputBuffer.length > maxSize && quality > 20);


    const putParams = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: outputBuffer,
      ContentType: 'image/jpeg',
      Metadata: { optimized: 'true' }, 
    });

    await s3.send(putParams);

    return { status: 'Image successfully optimized and overwritten', key };
  } catch (error) {
    console.error("Error processing image:", error);
    return { status: 'Error processing image', error: error.message };
  }
};
