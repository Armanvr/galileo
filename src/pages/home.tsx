import { useEffect, useState } from 'preact/hooks'
import { AstronomyCard } from '../components/astronomy-card'
import type { AstronomyObject } from '../types/astronomy'

export function HomePage() {
	const [items, setItems] = useState<AstronomyObject[]>([])
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const controller = new AbortController()

		async function fetchAstronomy() {
			try {
				const response = await fetch(`${import.meta.env.SERVER_URL}/api/astronomy`, {
					signal: controller.signal,
				})
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`)
				}
				const data = (await response.json()) as AstronomyObject[]
				setItems(data)
				setStatus('success')
			} catch (err) {
				if (controller.signal.aborted) return
				setError(err instanceof Error ? err.message : 'Erreur inconnue')
				setStatus('error')
			}
		}

		fetchAstronomy()
		return () => controller.abort()
	}, [])

	return (
		<>
			{status === 'loading' && <p class='text-zinc-400'>Chargement des données…</p>}

			{status === 'error' && (
				<div class='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300'>
					Impossible de charger les données : {error}
				</div>
			)}

			{status === 'success' && items.length === 0 && (
				<p class='text-zinc-400'>Aucun objet astronomique disponible.</p>
			)}

			{status === 'success' && items.length > 0 && (
				<section class='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
					{items.map((item) => (
						<AstronomyCard key={item._id} item={item} />
					))}
				</section>
			)}
		</>
	)
}
