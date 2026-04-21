import mongoose from 'mongoose'
import { env } from '../config/env'

/**
 * Open the Mongoose connection to MongoDB.
 */
export async function connectToDatabase(): Promise<void> {
	await mongoose.connect(env.MONGO_URI)
	console.log('Connected to MongoDB')
}

/**
 * Close the Mongoose connection. Used during graceful shutdown.
 */
export async function disconnectFromDatabase(): Promise<void> {
	await mongoose.disconnect()
}
