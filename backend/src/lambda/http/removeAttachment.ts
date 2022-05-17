import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { removeTodoAttachment } from '../businessLogic/todos'
import { getUserId } from '../helpers/auth'
import { removeAttachment } from '../dataLayer/attachment'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const payload = JSON.parse(event.body)
    const { todoId, s3Key } = payload;
    const userId: string = getUserId(event);
    // Remove from S3 bucket
    await removeAttachment(s3Key);
    // Set attachment is empty in DynamoDB
    await removeTodoAttachment(userId, todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({})
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors(
      {
        origin: "*",
        credentials: true,
      }
    )
  )
