import type { Request, Response } from 'express'
import { Astronomy } from '../models/astronomy.model'

/**
 * Retrieve every astronomical record stored in MongoDB.
 *
 * @route   GET /api/astronomy
 * @returns {object[]} A JSON array containing all documents from the
 *                     astronomy collection.
 * @throws  {500} If the database query fails.
 */
export async function getAllAstronomy(_req: Request, res: Response): Promise<void> {
	try {
		const data = await Astronomy.find({}).lean()
		res.json(data)
	} catch (error) {
		console.error('Failed to fetch astronomy data:', error)
		res.status(500).json({ error: 'Failed to fetch astronomy data' })
	}
}
