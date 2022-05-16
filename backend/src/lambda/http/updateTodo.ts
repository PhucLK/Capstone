import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../businessLogic/todos'
import { UpdateTodoRequest } from '../types/Todo'
import { createLogger } from '../helpers/logger';
import { getUserId } from '../helpers/auth'

const logger = createLogger('Update Todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Starting update todo ', event);
    const todoId = event.pathParameters.todoId;
    const userId: string = getUserId(event);
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    logger.info('Update todo ', updatedTodo)

    const updatedItem = await updateTodo(userId, todoId, updatedTodo);

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
