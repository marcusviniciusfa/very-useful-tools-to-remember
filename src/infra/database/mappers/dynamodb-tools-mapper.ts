import { Tag } from '../../../domain/entities/tag'
import { Tool } from '../../../domain/entities/tool'
import { ToolRow } from '../repositories/tools-repository-dynamodb'

export class DynamoDBToolsMapper {
  static toDynamoDB(tool: Tool): ToolRow {
    return {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      link: tool.link,
      tags: tool.tags.map((tag) => tag.value),
    }
  }

  static toDomain(toolRow: ToolRow): Tool {
    return new Tool(
      {
        title: toolRow.title,
        description: toolRow.description,
        link: toolRow.link,
        tags: toolRow.tags.map((tag) => new Tag(tag)),
      },
      toolRow.id,
    )
  }
}
