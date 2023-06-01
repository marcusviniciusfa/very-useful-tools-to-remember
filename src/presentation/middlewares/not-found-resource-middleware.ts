import middy from '@middy/core'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { NotFoundError } from '../errors/not-found-error'

export function notFoundResourceMiddleware(): middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
  const middleware: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (request) => {
    const { event } = request
    if (event.routeKey === '$default') {
      const { method, path } = event.requestContext.http
      throw new NotFoundError(`route '${method} ${path}' not found`)
    }
  }
  return {
    before: middleware,
  }
}
