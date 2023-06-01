import middy from '@middy/core'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { AppError } from '../errors/app-error'
import { InternalServerError } from '../errors/internal-server-error'
import { GatewayResponse } from '../http/gateway-response'

export function errorMiddleware(): middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
  const middleware: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (request) => {
    let error = request.error as AppError
    if (!error.statusCode) {
      error = new InternalServerError('internal server error')
    }
    console.error(error.stack)
    const output = { statusCode: error.statusCode, error: error.getMessageWithEmoji() }
    request.response = GatewayResponse.prepare(output, error.statusCode)
    return
  }
  return {
    onError: middleware,
  }
}
