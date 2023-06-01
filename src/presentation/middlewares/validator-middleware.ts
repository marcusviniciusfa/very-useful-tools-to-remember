import middy from '@middy/core'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { ZodObject } from 'zod'
import { BadRequestError } from '../errors/bad-request-error'

type RequestKeysToValidate = keyof Pick<APIGatewayProxyEventV2, 'body' | 'pathParameters' | 'queryStringParameters'>

interface RequestValuesToValidate {
  [field: string]: any
}

export function validatorMiddleware(routKey: string, dto: ZodObject<any>, keysToValidate: RequestKeysToValidate[] = ['body']): middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
  const middleware: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (request) => {
    const { event } = request
    if (event?.routeKey !== routKey) {
      return
    }
    const input: RequestValuesToValidate = {
      body: event.body,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
    }
    const valueToValidate: RequestValuesToValidate = {}
    keysToValidate.map((key) => {
      if (input[key]) {
        if (typeof input[key] === 'string') {
          const inputValueObject = JSON.parse(input[key])
          input[key] = inputValueObject
        }
        if (typeof input[key] === 'object') {
          Object.assign(valueToValidate, input[key])
          return
        }
      }
    })
    const inputCheck = dto.safeParse(valueToValidate)
    if (!inputCheck.success) {
      const { path: key, message } = inputCheck.error.issues[0]
      throw new BadRequestError(`#${key} property ${message}`)
    }
  }
  return {
    before: middleware,
  }
}
