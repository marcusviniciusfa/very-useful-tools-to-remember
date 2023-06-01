import { z as zod } from 'zod'

export const SaveToolInputValidator = zod.object({
  id: zod.string({ invalid_type_error: 'must be a string type' }).uuid('has a uuid format').optional(),
  title: zod.string({ invalid_type_error: 'must be a string type', required_error: 'is required' }).min(1, 'must contain a string with length greater than 0'),
  link: zod.string({ invalid_type_error: 'must be a string type', required_error: 'is required' }).url('has a url format'),
  description: zod.string({ invalid_type_error: 'must be a string type', required_error: 'is required' }).min(1, 'must contain a string with length greater than 0'),
  tags: zod
    .array(zod.string({ invalid_type_error: 'must be a string type' }).min(1, 'must contain at least one string with length greater than 0'), { invalid_type_error: 'must be an array', required_error: 'is required' })
    .min(1, 'must contain at least one string'),
})
