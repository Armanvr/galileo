import type { AstronomyObject } from '../types/astronomy'

interface AstronomyCardProps {
	item: AstronomyObject
}

function formatNumber(value: number | undefined, suffix = ''): string | null {
	if (value === undefined || value === null) return null
	return `${value.toLocaleString('fr-FR')}${suffix}`
}

export function AstronomyCard({ item }: AstronomyCardProps) {
	const stats: Array<{ label: string; value: string | null }> = [
		{ label: 'Constellation', value: item.constellation ?? null },
		{ label: 'Désignation', value: item.designation ?? null },
		{ label: 'Classe spectrale', value: item.spectral_class ?? null },
		{ label: 'Distance', value: formatNumber(item.distance_ly, ' al') },
		{ label: 'Magnitude apparente', value: formatNumber(item.apparent_magnitude) },
		{ label: 'Masse', value: formatNumber(item.mass_solar, ' M☉') },
		{ label: 'Rayon', value: formatNumber(item.radius_solar, ' R☉') },
		{ label: 'Température', value: formatNumber(item.temperature_K, ' K') },
	].filter((stat) => stat.value !== null)

	return (
		<article class='group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg shadow-black/20 transition hover:border-indigo-500/60 hover:bg-zinc-900'>
			<header class='flex items-start justify-between gap-3'>
				<div class='space-y-1'>
					<h2 class='text-xl font-semibold text-zinc-50'>{item.name}</h2>
					<p class='text-xs uppercase tracking-wider text-indigo-400'>{item.type}</p>
				</div>
				{item.has_known_planets && (
					<span class='rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300'>
						Planètes connues
					</span>
				)}
			</header>

			<dl class='grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2'>
				{stats.map((stat) => (
					<div key={stat.label} class='flex flex-col'>
						<dt class='text-[11px] uppercase tracking-wider text-zinc-500'>{stat.label}</dt>
						<dd class='text-zinc-200'>{stat.value}</dd>
					</div>
				))}
			</dl>

			{item.tags && item.tags.length > 0 && (
				<footer class='flex flex-wrap gap-2 pt-2'>
					{item.tags.map((tag) => (
						<span key={tag} class='rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300'>
							#{tag}
						</span>
					))}
				</footer>
			)}
		</article>
	)
}
