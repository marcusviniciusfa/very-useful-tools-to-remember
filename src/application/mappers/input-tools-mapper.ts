import { Tag } from '../../domain/entities/tag'
import { Tool } from '../../domain/entities/tool'

export interface ToolInput {
  id: string
  title: string
  description: string
  link: string
  tags: string[]
}

export class InputToolsMapper {
  static toDomain(input: ToolInput): Tool {
    return new Tool(
      {
        title: input.title,
        description: input.description,
        link: input.link,
        tags: input.tags.map((tag) => new Tag(tag)),
      },
      input.id,
    )
  }
}
