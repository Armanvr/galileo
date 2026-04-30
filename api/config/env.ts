/**
 * Centralised environment configuration.
 *
 * Reads and validates the environment variables required by the API.
 * The process exits early if a mandatory variable is missing so we fail
 * fast at startup rather than when a request hits the database.
 */

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
	console.error('Missing MONGODB_URI environment variable')
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

const CLIENT_URL = process.env.CLIENT_URL

if (!CLIENT_URL) {
	console.error('Missing CLIENT_URL environment variable')
	process.exit(1)
}

const RESEND_API_KEY = process.env.RESEND_API_KEY

if (!RESEND_API_KEY) {
	console.error('Missing RESEND_API_KEY environment variable')
	process.exit(1)
}

export const env = {
	PORT: process.env.PORT || 3001,
	MONGODB_URI: MONGODB_URI as string,
	ALLOWED_ORIGINS,
	CLIENT_URL: CLIENT_URL as string,
	RESEND_API_KEY: RESEND_API_KEY as string,
} as const
