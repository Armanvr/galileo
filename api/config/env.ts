/**
 * Centralised environment configuration.
 *
 * Reads and validates the environment variables required by the API.
 * The process exits early if a mandatory variable is missing so we fail
 * fast at startup rather than when a request hits the database.
 */

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
	console.error('Missing MONGO_URI environment variable')
	process.exit(1)
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? process.env.CLIENT_URL ?? '')
	.split(',')
	.map((origin) => origin.trim())
	.filter((origin) => origin.length > 0)

if (ALLOWED_ORIGINS.length === 0) {
	console.error('Missing ALLOWED_ORIGINS (or CLIENT_URL) environment variable')
	process.exit(1)
}

export const env = {
	PORT: 3001,
	MONGO_URI: MONGO_URI as string,
	ALLOWED_ORIGINS,
} as const
