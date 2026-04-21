import cors, { type CorsOptions } from 'cors'
import express from 'express'
import { env } from './config/env'
import { astronomyRouter } from './routes/astronomy.routes'
import { healthRouter } from './routes/health.routes'

/**
 * Configure and export the Express application.
 *
 * All routers are mounted under the `/api` prefix so the HTTP surface
 * stays consistent and easy to proxy from the frontend.
 */
export const app = express()

/**
 * CORS policy: only origins explicitly listed in `ALLOWED_ORIGINS`
 * (or `CLIENT_URL`) can reach the API. Requests without an `Origin`
 * header (e.g. curl, server-to-server, health checks) are allowed so
 * internal tooling keeps working.
 */
const allowedOrigins = new Set(env.ALLOWED_ORIGINS)

const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.has(origin)) {
			callback(null, true)
			return
		}
		callback(new Error(`Origin ${origin} is not allowed by CORS`))
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api', healthRouter)
app.use('/api', astronomyRouter)
