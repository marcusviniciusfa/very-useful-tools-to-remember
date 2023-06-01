import axios from 'axios'
import * as dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ToolsMigrations } from '../migrations/tools-migrations'

dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') })

/**
 * ? Adicionei `{ retry: true }` ao final porque a primeira requisição ao lambda costuma a ter um timeout alto, e o teste não passa. O retry faz com que uma nova requisição seja feita caso a primeira falhe (por timeout, por exemplo). Talvez esse problema fosse resolvido aumentando o timeout global (ex.: `{ testTimeout: 10000 }`) no arquivo `vitest.config.ts`, mas, isso mudaria o timeout para todos os testes, inclusive de integração e unitários (que não sofrem com esse problema)
 */
describe(
  '[testes end-to-end] verificando o comportamento da api',
  async () => {
    await ToolsMigrations.deleteTools()
    afterEach(async () => {
      await ToolsMigrations.deleteTools()
    })

    const headers = { 'Content-Type': 'application/json' }
    const baseUrl = process.env.AWS_API_GATEWAY_HTTP_BASE_URL_LOCAL as string
    const tools = [
      {
        id: randomUUID(),
        title: 'notion',
        description: 'All in one tool to organize teams and ideas. Write, plan, collaborate, and get organized.',
        link: 'https://www.notion.so/',
        tags: ['organization', 'planning', 'collaboration', 'writing', 'calendar'],
      },
      {
        id: randomUUID(),
        title: 'json-server',
        link: 'https://github.com/typicode/json-server',
        description: 'Fake REST API based on a json schema. Useful for mocking and creating APIs for front-end devs to consume in coding challenges.',
        tags: ['api', 'json', 'schema', 'node', 'github', 'rest'],
      },
      {
        id: randomUUID(),
        title: 'fastify',
        link: 'https://www.fastify.io/',
        description: 'Extremely fast and simple, low-overhead web framework for NodeJS. Supports HTTP2.',
        tags: ['web', 'framework', 'node', 'http2', 'https', 'localhost'],
      },
    ]

    it('deve fazer uma requisição GET /api/tools e receber um array de tools', async () => {
      const [tool] = tools

      await axios({
        headers,
        url: `${baseUrl}/api/tools`,
        method: 'post',
        data: tool,
      })

      const { data, status } = await axios({
        headers,
        url: `${baseUrl}/api/tools`,
        method: 'get',
      })

      expect(status).toBe(200)
      expect(data).toBeInstanceOf(Array)
      expect(data[0]).toHaveProperty('title', tool.title)
      expect(data[0]).toHaveProperty('id', tool.id)
      expect(data[0].tags).toHaveLength(5)
    })

    it('deve fazer uma requisição GET /api/tools filtrando por "?tag=node" e receber um array de tools que contenham a tag', async () => {
      for (const tool of tools) {
        await axios({
          headers,
          url: `${baseUrl}/api/tools`,
          method: 'post',
          data: tool,
        })
      }

      const { data, status } = await axios({
        headers,
        url: `${baseUrl}/api/tools?tag=node`,
        method: 'get',
      })

      expect(status).toBe(200)
      expect(data).toHaveLength(2)
    })

    it('deve fazer uma requisição GET /api/tool/{id} e receber um tool', async () => {
      const [tool] = tools
      await axios({
        headers,
        url: `${baseUrl}/api/tools`,
        method: 'post',
        data: tool,
      })

      const { data, status } = await axios({
        headers,
        url: `${baseUrl}/api/tools/${tool.id}`,
        method: 'get',
      })

      expect(status).toBe(200)
      expect(data).toHaveProperty('id', tool.id)
    })

    it('deve fazer uma requisição GET /api/tool/{id} e receber um erro "bad request" caso não encontre', async () => {
      expect.hasAssertions()
      try {
        await axios({
          headers,
          url: `${baseUrl}/api/tools/${randomUUID()}`,
          method: 'get',
        })
      } catch (error: any) {
        expect(error.response.status).toBe(404)
        expect(error.response.data).toHaveProperty('error', 'tool not found 🔎')
      }
    })

    it('deve fazer uma requisição DELETE /api/tools/{id} e deletar um tool', async () => {
      expect.hasAssertions()
      const [tool] = tools
      await axios({
        headers,
        url: `${baseUrl}/api/tools`,
        method: 'post',
        data: tool,
      })

      const { status } = await axios({
        headers,
        url: `${baseUrl}/api/tools/${tool.id}`,
        method: 'delete',
      })

      try {
        await axios({
          headers,
          url: `${baseUrl}/api/tools/${tool.id}`,
          method: 'get',
        })
      } catch (error: any) {
        expect(status).toBe(204)
        expect(error.response.status).toBe(404)
        expect(error.response.data).toHaveProperty('error', 'tool not found 🔎')
      }
    })

    const title = 'a'.repeat(10)
    const link = 'https://'.concat('a'.repeat(10)).concat('.com')
    const description = 'a'.repeat(50)
    const tags = ['b', 'c', 'd']

    it('deve fazer uma requisição POST /api/tools e retornar o tool criado', async () => {
      const [tool] = tools
      const { data, status } = await axios({
        headers,
        url: `${baseUrl}/api/tools`,
        method: 'post',
        data: tool,
      })

      expect(status).toBe(201)
      expect(data).toHaveProperty('id', tool.id)
    })

    it.each([
      { data: { link, description, tags }, expectedError: '#title property is required ❌' },
      { data: { title: 1, link, description, tags }, expectedError: '#title property must be a string type ❌' },
      { data: { title: '', link, description, tags }, expectedError: '#title property must contain a string with length greater than 0 ❌' },
      { data: { title, description, tags }, expectedError: '#link property is required ❌' },
      { data: { title, link: 1, description, tags }, expectedError: '#link property must be a string type ❌' },
      { data: { title, link: '', description, tags }, expectedError: '#link property has a url format ❌' },
      { data: { title, link, tags }, expectedError: '#description property is required ❌' },
      { data: { title, link, description: 1, tags }, expectedError: '#description property must be a string type ❌' },
      { data: { title, link, description: '', tags }, expectedError: '#description property must contain a string with length greater than 0 ❌' },
      { data: { title, link, description }, expectedError: '#tags property is required ❌' },
      { data: { title, link, description, tags: [] }, expectedError: '#tags property must contain at least one string ❌' },
      { data: { title, link, description, tags: [1] }, expectedError: '#tags,0 property must be a string type ❌' },
      { data: { title, link, description, tags: '' }, expectedError: '#tags property must be an array ❌' },
    ])('deve fazer POST /api/tools com erro $expectedError', async ({ data, expectedError }) => {
      expect.hasAssertions()
      try {
        await axios({
          headers,
          url: `${baseUrl}/api/tools`,
          method: 'post',
          data,
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
        expect(error.response.data).toHaveProperty('error', expectedError)
      }
    })

    it('deve fazer uma requisição PATCH /api/tools e retornar o tool (parcialmente atualizado)', async () => {
      const [tool] = tools
      await axios({
        headers,
        url: `${baseUrl}/api/tools`,
        method: 'post',
        data: tool,
      })

      const newDescription = 'a'.repeat(50)
      const { data, status } = await axios({
        headers,
        url: `${baseUrl}/api/tools/${tool.id}`,
        method: 'patch',
        data: { description: newDescription },
      })

      expect(status).toBe(200)
      expect(data).toHaveProperty('id', tool.id)
      expect(data).toHaveProperty('description', newDescription)
    })

    it('deve fazer uma requisição para PATCH /api/tools/{id} e retornar um error caso a tool não exista', async () => {
      expect.hasAssertions()
      const id = randomUUID()
      try {
        await axios({
          headers,
          url: `${baseUrl}/api/tools/${id}`,
          method: 'patch',
          data: {},
        })
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data).toHaveProperty('error', 'tool not found 🔎')
      }
    })

    it('deve retornar um error caso seja feita uma requisição para um recurso que não foi exposto pela API', async () => {
      expect.hasAssertions()
      try {
        await axios({
          headers,
          url: `${baseUrl}/api/any-resource`,
          method: 'get',
        })
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data).toHaveProperty('error', "route 'get /api/any-resource' not found 🔎")
      }
    })
  },
  { retry: 2 },
)
