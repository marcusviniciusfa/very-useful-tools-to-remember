import { z as zod } from 'zod'

export const GetToolsInputValidator = zod.object({
  tag: zod.string({ invalid_type_error: 'must be a string type' }).min(1, 'must contain a string with length greater than 0').optional(),
})
