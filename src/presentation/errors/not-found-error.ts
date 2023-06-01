import { HTTP_CODES } from '../http/http-codes'
import { AppError } from './app-error'

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message)
    this.statusCode = HTTP_CODES.NOT_FOUND
    this.emoji = '🔎'
  }
}
