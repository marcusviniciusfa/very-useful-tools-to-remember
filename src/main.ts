import middy from '@middy/core'
import { APIGatewayProxyEventV2, Handler } from 'aws-lambda'
import { DeleteToolUseCase, GetToolUseCase, GetToolsUseCase, SaveToolUseCase, UpdateToolUseCase } from './application/use-cases'
import { ToolsRepositoryDynamoDB } from './infra/database/repositories/tools-repository-dynamodb'
import { GatewayResponse } from './presentation/http/gateway-response'
import { HTTP_CODES } from './presentation/http/http-codes'
import { errorMiddleware } from './presentation/middlewares/error-middleware'
import { notFoundResourceMiddleware } from './presentation/middlewares/not-found-resource-middleware'
import { validatorMiddleware } from './presentation/middlewares/validator-middleware'
import { GetToolsInputValidator } from './presentation/validators/get-tools-input-validator'
import { PartialToolUpdateInputValidator } from './presentation/validators/partial-tool-update-input-validator'
import { SaveToolInputValidator } from './presentation/validators/save-tool-input-validator'

const mainHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  if (event.routeKey === 'DELETE /api/tools/{id}') {
    return await deleteTool(event)
  }
  if (event.routeKey === 'GET /api/tools/{id}') {
    return await getTool(event)
  }
  if (event.routeKey === 'GET /api/tools') {
    return await getTools(event)
  }
  if (event.routeKey === 'POST /api/tools') {
    return await saveTool(event)
  }
  if (event.routeKey === 'PATCH /api/tools/{id}') {
    return await partialToolUpdate(event)
  }
}

async function deleteTool(event: APIGatewayProxyEventV2) {
  const { id } = event.pathParameters as { id: string }
  const toolsRepository = new ToolsRepositoryDynamoDB()
  const deleteToolUseCase = new DeleteToolUseCase(toolsRepository)
  await deleteToolUseCase.execute(id)
  return GatewayResponse.prepare({}, HTTP_CODES.NO_CONTENT)
}

async function getTool(event: APIGatewayProxyEventV2) {
  const { id } = event.pathParameters as { id: string }
  const toolsRepository = new ToolsRepositoryDynamoDB()
  const getToolUseCase = new GetToolUseCase(toolsRepository)
  const output = await getToolUseCase.execute(id)
  return GatewayResponse.prepare(output, HTTP_CODES.OK)
}

async function getTools(event: APIGatewayProxyEventV2) {
  const tag = event?.queryStringParameters?.tag
  const toolsRepository = new ToolsRepositoryDynamoDB()
  const getToolsUseCase = new GetToolsUseCase(toolsRepository)
  const output = await getToolsUseCase.execute(tag)
  return GatewayResponse.prepare(output, HTTP_CODES.OK)
}

async function saveTool(event: APIGatewayProxyEventV2) {
  const body = JSON.parse(event.body as string)
  const toolsRepository = new ToolsRepositoryDynamoDB()
  const saveToolUseCase = new SaveToolUseCase(toolsRepository)
  const output = await saveToolUseCase.execute(body)
  return GatewayResponse.prepare(output, HTTP_CODES.CREATED)
}

async function partialToolUpdate(event: APIGatewayProxyEventV2) {
  const body = JSON.parse(event.body as string)
  const { id } = event.pathParameters as { id: string }
  const toolsRepository = new ToolsRepositoryDynamoDB()
  const updateToolUseCase = new UpdateToolUseCase(toolsRepository)
  const output = await updateToolUseCase.execute({ id, ...body })
  return GatewayResponse.prepare(output, HTTP_CODES.OK)
}

const handler = middy(mainHandler)

handler.use(notFoundResourceMiddleware())
handler.use(validatorMiddleware('POST /api/tools', SaveToolInputValidator))
handler.use(validatorMiddleware('PATCH /api/tools/{id}', PartialToolUpdateInputValidator))
handler.use(validatorMiddleware('GET /api/tools', GetToolsInputValidator, ['queryStringParameters']))
handler.use(errorMiddleware())

export { handler }
