import { Tool } from '../../domain/entities/tool'
import { NotFoundError } from '../../presentation/errors/not-found-error'
import { ToolOutput, ToolsPresenter } from '../../presentation/presenters/tools-presenter'
import { ToolInput } from '../mappers/input-tools-mapper'
import { ToolsRepository } from '../repositories/tools-repository'

export class UpdateToolUseCase {
  constructor(private readonly toolsRepository: ToolsRepository) {}

  async execute(input: ToolInput): Promise<ToolOutput> {
    const oldTool = await this.toolsRepository.getOneById(input.id)
    if (!oldTool) {
      throw new NotFoundError('tool not found')
    }
    if (input.tags) {
      oldTool.destroyTags()
      input.tags.map((tag) => {
        oldTool.addTag(tag)
      })
    }
    const tool = new Tool(
      {
        title: input.title ?? oldTool.title,
        description: input.description ?? oldTool.description,
        link: input.link ?? oldTool.link,
        tags: oldTool.tags,
      },
      input.id ?? oldTool.id,
    )
    const newTool = await this.toolsRepository.update(tool)
    return ToolsPresenter.toView(newTool)
  }
}
