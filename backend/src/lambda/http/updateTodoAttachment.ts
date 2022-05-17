import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodoAttachment } from '../businessLogic/todos'
import { createLogger } from '../helpers/logger';
import { getUserId } from '../helpers/auth'

const logger = createLogger('Update Todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Starting update todo attachment', event);
    const todoId = event.pathParameters.todoId;
    const payload = JSON.parse(event.body);
    const userId: string = getUserId(event);
    const updatedItem = await updateTodoAttachment(userId, todoId, payload.s3Key);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: updatedItem
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
