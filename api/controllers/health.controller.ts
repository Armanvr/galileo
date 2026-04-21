import type { Request, Response } from 'express'

/**
 * Health check endpoint.
 *
 * @route   GET /api/health
 * @returns {{ status: "ok" }} A JSON payload confirming the server is up.
 */
export function getHealth(_req: Request, res: Response): void {
	res.json({ status: 'ok' })
}
