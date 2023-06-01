import { ExecuteStatementCommand } from '@aws-sdk/client-dynamodb'
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { ToolsRepository } from '../../../application/repositories/tools-repository'
import { Tag } from '../../../domain/entities/tag'
import { Tool } from '../../../domain/entities/tool'
import { DatabaseConnection } from '../database-connection'
import { DynamoDBAdapter } from '../dynamodb-adapter'
import { DynamoDBToolsMapper } from '../mappers/dynamodb-tools-mapper'

const AWS_DYNAMODB_TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME as string

export interface ToolRow {
  id: string
  title: string
  description: string
  link: string
  tags: string[]
}

export class ToolsRepositoryDynamoDB implements ToolsRepository {
  databaseConnection: DatabaseConnection

  constructor() {
    this.databaseConnection = new DynamoDBAdapter()
  }

  async save(tool: Tool): Promise<Tool> {
    await this.databaseConnection.query(
      new PutCommand({
        TableName: AWS_DYNAMODB_TABLE_NAME,
        Item: DynamoDBToolsMapper.toDynamoDB(tool),
        ReturnValues: 'ALL_OLD',
      }),
    )
    return tool
  }

  async getOneById(id: string): Promise<Tool | null> {
    const { Item: toolRow }: { Item: ToolRow } = await this.databaseConnection.query(new GetCommand({ TableName: AWS_DYNAMODB_TABLE_NAME, Key: { id } }))
    if (!toolRow) {
      return null
    }
    const tool = DynamoDBToolsMapper.toDomain(toolRow)
    return tool
  }

  async getAll(tag: Tag | null): Promise<Tool[]> {
    const filter = tag ? { ExpressionAttributeValues: { ':tagValue': { S: tag.value } }, FilterExpression: 'contains (tags, :tagValue)' } : {}
    const { Items: toolRows }: { Items: ToolRow[] } = await this.databaseConnection.query(
      new ScanCommand({
        TableName: AWS_DYNAMODB_TABLE_NAME,
        /**
         * tinha criado um filtro para não precisar trazer todos os dados para filtrar no backend
         * e ele estava funcionando, até que parou de funcionar de repente. Sendo assim, resolvi
         * adicionar o filtro ao backend de forma provisória para mater a feature.
         */
        // ...filter,
      }),
    )
    let tools: Tool[] = []
    if (!tag) {
      tools = toolRows.map(DynamoDBToolsMapper.toDomain)
      return tools
    }
    toolRows.map((toolRow) => {
      if (toolRow.tags.includes(tag?.value)) {
        tools.push(DynamoDBToolsMapper.toDomain(toolRow))
      }
    })
    return tools
  }

  async delete(id: string): Promise<void> {
    await this.databaseConnection.query(
      new DeleteCommand({
        TableName: AWS_DYNAMODB_TABLE_NAME,
        Key: { id },
      }),
    )
  }

  async update(tool: Tool): Promise<Tool> {
    const command = new ExecuteStatementCommand({
      Statement: `UPDATE "${AWS_DYNAMODB_TABLE_NAME}" SET title = ? SET description = ? SET link = ? SET tags = ? WHERE id = ? RETURNING ALL NEW *`,
      Parameters: [{ S: tool.title }, { S: tool.description }, { S: tool.link }, { L: tool.tags.map((tag) => ({ S: tag.value })) }, { S: tool.id }],
    })
    const {
      Items: [unconvertedTool],
    } = await this.databaseConnection.query(command)
    const convertedTool = unmarshall(unconvertedTool) as ToolRow
    const tools = DynamoDBToolsMapper.toDomain(convertedTool)
    return tools
  }
}
