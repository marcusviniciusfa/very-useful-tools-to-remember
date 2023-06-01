export class AppError extends Error {
  statusCode: number
  emoji: string

  constructor(message: string) {
    super(message.toLowerCase())
  }

  getMessageWithEmoji() {
    return this.message.concat(` ${this.emoji}`)
  }
}
