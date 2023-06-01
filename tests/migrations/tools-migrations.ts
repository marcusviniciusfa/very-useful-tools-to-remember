import { BatchExecuteStatementCommand, BatchExecuteStatementCommandInput, CreateTableCommand, DeleteTableCommand, DynamoDBClient, ExecuteStatementCommandInput, ScanCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import toolsSeeds from './seeds.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') })

const AWS_DYNAMODB_TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME as string

const dynamoDbClient = new DynamoDBClient({})
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: { removeUndefinedValues: true },
})

interface Tool {
  id?: string
  title: string
  link: string
  description: string
  tags: string[]
}

export class ToolsMigrations {
  static async createTable(tableName: string = AWS_DYNAMODB_TABLE_NAME) {
    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    })
    await dynamoDbDocClient.send(command)
    dynamoDbDocClient.destroy()
  }

  static async deleteTable(tableName: string = AWS_DYNAMODB_TABLE_NAME) {
    const command = new DeleteTableCommand({ TableName: tableName })
    await dynamoDbDocClient.send(command)
    dynamoDbDocClient.destroy()
  }

  static async saveTools(tableName: string | null = AWS_DYNAMODB_TABLE_NAME, tools: Tool[] = toolsSeeds) {
    if (!tableName) {
      tableName = AWS_DYNAMODB_TABLE_NAME
    }
    const commands: BatchExecuteStatementCommandInput = {
      Statements: tools.map((tool): ExecuteStatementCommandInput => {
        return {
          Statement: `INSERT INTO "${tableName}" value {'id':?, 'title':?, 'description':?, 'link':?, 'tags':?}`,
          Parameters: [{ S: tool.id ?? randomUUID() }, { S: tool.title }, { S: tool.description }, { S: tool.link }, { L: tool.tags.map((attributeValue) => ({ S: attributeValue })) }],
        }
      }),
    }
    const createItemsBatchStatementCommand = new BatchExecuteStatementCommand(commands)
    await dynamoDbDocClient.send(createItemsBatchStatementCommand)
    dynamoDbDocClient.destroy()
  }

  static async deleteTools(tableName: string = AWS_DYNAMODB_TABLE_NAME) {
    const { Items: tools } = await dynamoDbDocClient.send(new ScanCommand({ TableName: tableName }))
    if (!tools || tools.length === 0) {
      return
    }
    const commands: BatchExecuteStatementCommandInput = {
      Statements: tools.map((tool): ExecuteStatementCommandInput => {
        return {
          Statement: `DELETE FROM "${tableName}" WHERE id=?`,
          Parameters: [tool.id],
        }
      }),
    }
    const deleteItemsBatchStatementCommand = new BatchExecuteStatementCommand(commands)
    await dynamoDbDocClient.send(deleteItemsBatchStatementCommand)
    dynamoDbDocClient.destroy()
  }
}
