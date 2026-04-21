/**
 * Shape of an astronomical record returned by `GET /api/astronomy`.
 * Mirrors the server-side `AstronomyObject` interface.
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
