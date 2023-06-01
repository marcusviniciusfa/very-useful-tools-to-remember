import { NotFoundError } from '../../presentation/errors/not-found-error'
import { ToolsPresenter } from '../../presentation/presenters/tools-presenter'
import { ToolsRepository } from '../repositories/tools-repository'

export class GetToolUseCase {
  constructor(private readonly toolsRepository: ToolsRepository) {}

  async execute(id: string) {
    const tool = await this.toolsRepository.getOneById(id)
    if (!tool) {
      throw new NotFoundError('tool not found')
    }
    return ToolsPresenter.toView(tool)
  }
}
