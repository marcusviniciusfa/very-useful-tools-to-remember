import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DatabaseConnection } from './database-connection'

export class DynamoDBAdapter implements DatabaseConnection {
  private readonly documentClient: DynamoDBDocumentClient

  constructor() {
    const dynamoDbClient = new DynamoDBClient({})
    this.documentClient = DynamoDBDocumentClient.from(dynamoDbClient, { marshallOptions: { removeUndefinedValues: true } })
  }

  async query(command: any): Promise<any> {
    const output = await this.documentClient.send(command)
    await this.close()
    return output
  }

  async close(): Promise<void> {
    this.documentClient.destroy()
  }
}
