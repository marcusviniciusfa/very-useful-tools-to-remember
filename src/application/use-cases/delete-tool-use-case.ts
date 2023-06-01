import { ToolsRepository } from '../repositories/tools-repository'

export class DeleteToolUseCase {
  constructor(private readonly toolsRepository: ToolsRepository) {}

  async execute(id: string): Promise<void> {
    await this.toolsRepository.delete(id)
  }
}
