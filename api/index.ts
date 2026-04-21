import { app } from './app'
import { env } from './config/env'
import { connectToDatabase, disconnectFromDatabase } from './db/mongoose'

async function start(): Promise<void> {
	await connectToDatabase()
	app.listen(env.PORT, () => {
		console.log(`Server running on http://localhost:${env.PORT}`)
	})
}

start().catch((error) => {
	console.error('Failed to start server:', error)
	process.exit(1)
})

async function shutdown(): Promise<void> {
	await disconnectFromDatabase()
	process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
