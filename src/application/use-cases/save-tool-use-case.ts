import { ToolOutput, ToolsPresenter } from '../../presentation/presenters/tools-presenter'
import { InputToolsMapper, ToolInput } from '../mappers/input-tools-mapper'
import { ToolsRepository } from '../repositories/tools-repository'

export class SaveToolUseCase {
  constructor(private readonly toolsRepository: ToolsRepository) {}

  async execute(input: ToolInput): Promise<ToolOutput> {
    const tool = InputToolsMapper.toDomain(input)
    await this.toolsRepository.save(tool)
    return ToolsPresenter.toView(tool)
  }
}
