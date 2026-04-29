import { useEffect, useState } from 'preact/hooks'
import { navigate, useRoute } from '../lib/router'

type Status = 'loading' | 'success' | 'error'

export function VerifyPage() {
	const { search } = useRoute()
	const [status, setStatus] = useState<Status>('loading')
	const [message, setMessage] = useState<string | null>(null)

	useEffect(() => {
		const token = new URLSearchParams(search).get('token')

		if (!token) {
			setStatus('error')
			setMessage('Token manquant dans le lien de confirmation.')
			return
		}

		const controller = new AbortController()

		async function verify() {
			try {
				const response = await fetch(
					`${import.meta.env.SERVER_URL}/api/auth/verify?token=${encodeURIComponent(token as string)}`,
					{ signal: controller.signal },
				)
				const data = (await response.json().catch(() => ({}))) as {
					verified?: boolean
					error?: string
				}

				if (response.ok && data.verified) {
					setStatus('success')
					setMessage('Votre adresse email est confirmée. Bienvenue sur Galileo !')
					return
				}

				setStatus('error')
				setMessage(data.error ?? `Échec de la vérification (HTTP ${response.status}).`)
			} catch (err) {
				if (controller.signal.aborted) return
				setStatus('error')
				setMessage(err instanceof Error ? err.message : 'Erreur réseau inconnue.')
			}
		}

		verify()
		return () => controller.abort()
	}, [search])

	return (
		<section class='mx-auto max-w-md'>
			<div class='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-lg shadow-black/20'>
				<h2 class='text-2xl font-semibold text-zinc-50'>Confirmation de votre compte</h2>

				{status === 'loading' && <p class='mt-4 text-sm text-zinc-400'>Vérification de votre lien en cours…</p>}

				{status === 'success' && (
					<div class='mt-4 space-y-4'>
						<div class='rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200'>
							{message}
						</div>
						<button
							type='button'
							onClick={() => navigate('/')}
							class='w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400'
						>
							Retour à l'accueil
						</button>
					</div>
				)}

				{status === 'error' && (
					<div class='mt-4 space-y-4'>
						<div class='rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200'>
							{message}
						</div>
						<button
							type='button'
							onClick={() => navigate('/register')}
							class='w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400'
						>
							Recommencer l'inscription
						</button>
					</div>
				)}
			</div>
		</section>
	)
}
