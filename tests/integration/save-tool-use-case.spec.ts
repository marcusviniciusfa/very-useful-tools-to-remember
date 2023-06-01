import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import dotenv from 'dotenv'
import { randomInt, randomUUID } from 'node:crypto'
import path from 'node:path'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ToolInput } from '../../src/application/mappers/input-tools-mapper'
import { ToolsRepository } from '../../src/application/repositories/tools-repository'
import { Tag } from '../../src/domain/entities/tag'
import { Tool } from '../../src/domain/entities/tool'
import { SaveToolUseCase } from './../../src/application/use-cases/save-tool-use-case'
import { ToolsRepositoryDynamoDB } from './../../src/infra/database/repositories/tools-repository-dynamodb'

dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') })

describe('[testes de integração] verificando use case SaveToolUseCase', () => {
  let tool: ToolInput

  beforeEach(() => {
    tool = {
      id: randomUUID(),
      title: 'a'.repeat(randomInt(20)),
      description: 'a'.repeat(randomInt(50)),
      link: 'a'.repeat(randomInt(50)),
      tags: ['a'.repeat(randomInt(20)), 'a'.repeat(randomInt(20))],
    }
  })

  afterEach(() => {
    sinon.restore()
  })

  it('deve salvar uma tool usando o repositório de tools (com stub)', async () => {
    const toolsRepositoryStub = sinon.stub(DynamoDBDocumentClient.prototype, 'send')
    toolsRepositoryStub.resolves({ Item: tool })

    const toolsRepository = new ToolsRepositoryDynamoDB()
    const saveToolUseCase = new SaveToolUseCase(toolsRepository)
    const output = await saveToolUseCase.execute(tool)

    expect(output.id).toBe(tool.id)
  })

  it('deve salvar uma tool usando o repositório de tools (com fake)', async () => {
    const toolsRepositoryFake = new (class ToolsRepositoryFake implements ToolsRepository {
      async save(tool: Tool): Promise<Tool> {
        return Promise.resolve(tool)
      }
      async getOneById(id: string): Promise<Tool | null> {
        throw new Error('Method not implemented.')
      }
      async getAll(tag: Tag | null): Promise<Tool[]> {
        throw new Error('Method not implemented.')
      }
      async delete(id: string): Promise<void> {
        throw new Error('Method not implemented.')
      }
      async update(tool: Tool): Promise<Tool> {
        throw new Error('Method not implemented.')
      }
    })()
    const saveToolUseCase = new SaveToolUseCase(toolsRepositoryFake)
    const output = await saveToolUseCase.execute(tool)

    expect(output.id).toBe(tool.id)
  })

  /**
   * adicionar verificações com o spy
   */
  // it('deve salvar uma tool usando o repositório de tools (com spy)', async () => {
  //   const spy = vi.spyOn(ToolsRepositoryDynamoDB.prototype, 'save')

  //   const toolsRepository = new ToolsRepositoryDynamoDB()
  //   const saveToolUseCase = new SaveToolUseCase(toolsRepository)
  //   const output = await saveToolUseCase.execute(tool)

  //   expect(spy).toHaveBeenCalledOnce()
  // })
})
