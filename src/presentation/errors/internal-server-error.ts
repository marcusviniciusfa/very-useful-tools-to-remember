import { HTTP_CODES } from '../http/http-codes'
import { AppError } from './app-error'

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(message)
    this.statusCode = HTTP_CODES.INTERNAL_SERVER_ERROR
    this.emoji = '💥'
  }
}
