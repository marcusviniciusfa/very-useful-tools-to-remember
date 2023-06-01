import { APIGatewayProxyResultV2 } from 'aws-lambda'

export class GatewayResponse {
  constructor() {}

  static prepare(body: any, statusCode: number): APIGatewayProxyResultV2 {
    return {
      headers: { 'Content-Type': 'application/json' },
      statusCode,
      body: JSON.stringify(body),
    }
  }
}
