import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { deleteTodo } from '../businessLogic/todos'
import { getUserId } from '../helpers/auth'
import { removeAttachment } from '../dataLayer/attachment'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId: string = getUserId(event);
    await deleteTodo(userId, todoId);
    await removeAttachment(todoId);

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
