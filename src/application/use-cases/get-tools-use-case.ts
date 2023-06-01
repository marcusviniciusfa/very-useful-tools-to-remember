import { Tag } from '../../domain/entities/tag'
import { ToolsPresenter } from '../../presentation/presenters/tools-presenter'
import { ToolsRepository } from '../repositories/tools-repository'

export class GetToolsUseCase {
  constructor(private readonly toolsRepository: ToolsRepository) {}

  async execute(tagValue?: string) {
    const filter = tagValue ? new Tag(tagValue) : null
    const tools = await this.toolsRepository.getAll(filter)
    return tools.map(ToolsPresenter.toView)
  }
}
