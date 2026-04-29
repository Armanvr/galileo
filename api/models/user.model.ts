import mongoose from 'mongoose'
import { type User, userSchema } from '../schemas/user.schema'

/**
 * Compiled Mongoose model backed by {@link userSchema}.
 */
export const UserModel = mongoose.model<User>('User', userSchema)
