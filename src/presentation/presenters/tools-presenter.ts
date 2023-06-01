import { Tool } from '../../domain/entities/tool'

export interface ToolOutput {
  id: string
  title: string
  description: string
  link: string
  tags: string[]
}

export class ToolsPresenter {
  static toView(tool: Tool): ToolOutput {
    return {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      link: tool.link,
      tags: tool.tags.map((tag) => tag.value),
    }
  }
}
