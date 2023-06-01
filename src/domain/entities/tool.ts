import { randomUUID } from 'node:crypto'
import { Tag } from './tag'

export class Tool {
  id: string
  title: string
  description: string
  link: string
  tags: Tag[]

  constructor(props: { title: string; description: string; link: string; tags: Tag[] }, id?: string) {
    if (!id) {
      id = randomUUID()
    }
    Object.assign(this, { id, ...props })
  }

  addTag(value: string) {
    this.tags.push(new Tag(value))
  }

  removeTag(value: string) {
    const tagToRemove = new Tag(value)
    const indexToRemove = this.tags.findIndex((tag) => Object.is(tag, tagToRemove))
    this.tags.slice(indexToRemove, 1)
  }

  destroyTags() {
    this.tags = []
  }
}
