import { Tag } from '../../domain/entities/tag'
import { Tool } from '../../domain/entities/tool'

export interface ToolsRepository {
  save(tool: Tool): Promise<Tool>
  getOneById(id: string): Promise<Tool | null>
  getAll(tag: Tag | null): Promise<Tool[]>
  delete(id: string): Promise<void>
  update(tool: Tool): Promise<Tool>
}
