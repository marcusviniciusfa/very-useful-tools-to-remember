import { SaveToolInputValidator } from './save-tool-input-validator'

export const PartialToolUpdateInputValidator = SaveToolInputValidator.omit({ id: true }).partial()
