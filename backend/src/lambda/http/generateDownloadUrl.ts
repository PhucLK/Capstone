import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createAttachmentDownloadedUrl } from '../dataLayer/attachment';
import { createLogger } from '../helpers/logger';

const logger = createLogger('Generate Download URL');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event);
    const payload = JSON.parse(event.body);
    const s3Key = payload.s3Key;
    const downloadUrl = createAttachmentDownloadedUrl(s3Key);
    logger.info('Download url: %s', downloadUrl);

    return {
      statusCode: 202,
      body: JSON.stringify({
        downloadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(cors(
    {
      origin: "*",
      credentials: true,
    }
  ))

