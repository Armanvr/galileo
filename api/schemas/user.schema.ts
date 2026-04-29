import { Schema } from 'mongoose'

/**
 * Shape of a user record stored in MongoDB.
 */
export interface User {
	email: string
	passwordHash: string
	verified: boolean
	verificationToken?: string | null
	verificationTokenExpiresAt?: Date | null
	createdAt: Date
	updatedAt: Date
}

/**
 * Strict Mongoose schema for application users.
 *
 * - `email` is stored lowercased and trimmed, with a unique index so the same
 *   address cannot be registered twice with different casings.
 * - `verificationToken` / `verificationTokenExpiresAt` support the "confirm
 *   your email" flow and are cleared once the user is verified.
 * - `strict: "throw"` rejects any document containing unknown fields.
 * - `versionKey: false` disables Mongoose's `__v` field.
 */
export const userSchema = new Schema<User>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		passwordHash: { type: String, required: true },
		verified: { type: Boolean, required: true, default: false },
		verificationToken: { type: String, default: null },
		verificationTokenExpiresAt: { type: Date, default: null },
	},
	{
		collection: 'users',
		strict: 'throw',
		versionKey: false,
		timestamps: true,
	},
)
