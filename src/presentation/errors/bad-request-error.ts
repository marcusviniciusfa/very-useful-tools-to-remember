import { HTTP_CODES } from '../http/http-codes'
import { AppError } from './app-error'

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message)
    this.statusCode = HTTP_CODES.BAD_REQUEST
    this.emoji = '❌'
  }
}
