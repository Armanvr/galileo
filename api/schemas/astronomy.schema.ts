import { Schema } from 'mongoose'

/**
 * Shape of an astronomical record stored in MongoDB.
 */
export interface AstronomyObject {
	_id: string
	type: string
	name: string
	designation?: string
	constellation?: string
	distance_ly?: number
	apparent_magnitude?: number
	spectral_class?: string
	mass_solar?: number
	radius_solar?: number
	temperature_K?: number
	has_known_planets?: boolean
	tags?: string[]
}

/**
 * Strict Mongoose schema for astronomical objects.
 *
 * - `_id` is a user-provided string (e.g. "obj_001") rather than an ObjectId.
 * - `strict: "throw"` rejects any document containing unknown fields.
 * - `versionKey: false` disables Mongoose's `__v` field.
 */
export const astronomySchema = new Schema<AstronomyObject>(
	{
		_id: { type: String, required: true },
		type: { type: String, required: true },
		name: { type: String, required: true },
		designation: { type: String },
		constellation: { type: String },
		distance_ly: { type: Number },
		apparent_magnitude: { type: Number },
		spectral_class: { type: String },
		mass_solar: { type: Number },
		radius_solar: { type: Number },
		temperature_K: { type: Number },
		has_known_planets: { type: Boolean, default: false },
		tags: { type: [String], default: [] },
	},
	{
		collection: 'test',
		strict: 'throw',
		versionKey: false,
		_id: false,
	},
)
