import "source-map-support/register";
import * as AWS from "aws-sdk";
import { SNSEvent, S3EventRecord, SNSHandler } from "aws-lambda";
import * as middy from "middy";
import * as Jimp from "jimp/es";

import { createLogger } from "../helpers/logger";

const logger = createLogger("Re-size Image");

const s3 = new AWS.S3();

const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export const handler: SNSHandler = middy(async (event: SNSEvent) => {
  const snsRecord = event.Records[0];
  logger.info("Processing SNS event ", snsRecord);
  const s3EventStr = snsRecord.Sns.Message;
  const s3Event = JSON.parse(s3EventStr);
  logger.info("s3Event", s3Event);
  const record = s3Event.Records[0];
  await resizeImage(record);
});


export async function resizeImage(record: S3EventRecord) {
  logger.info('resizeImage -> record ', record);
  logger.info('resizeImage -> record.s3.object ', record['s3']['object']);
  logger.info('resizeImage -> record.s3.object.key 01 ', record['s3']['object']['key']);
  logger.info('resizeImage -> record.s3.object.key 02 ', record.s3.object.key);
  const key: string = record.s3.object.key
  logger.info("Processing S3 item with key: ", key);
  const response = await s3
    .getObject({
      Bucket: bucketName,
      Key: key,
    })
    .promise();

  const body = response.Body;
  const image = await Jimp.read(body);

  logger.info("Resizing image...!");
  image.resize(150, Jimp.AUTO);
  const convertedBuffer = await image.getBufferAsync(Jimp.AUTO);

  logger.info(`Rewrite image back to S3 bucket: ${key}`);
  await s3
    .putObject({
      Bucket: bucketName,
      Key: key,
      Body: convertedBuffer,
    })
    .promise();
}
