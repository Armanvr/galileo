import mongoose from 'mongoose'
import { type AstronomyObject, astronomySchema } from '../schemas/astronomy.schema'

/**
 * Compiled Mongoose model backed by {@link astronomySchema}.
 */
export const Astronomy = mongoose.model<AstronomyObject>('Astronomy', astronomySchema)
