import type { JSX } from 'preact'
import { useState } from 'preact/hooks'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const PASSWORD_MIN_LENGTH = 8

export function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [status, setStatus] = useState<Status>('idle')
	const [message, setMessage] = useState<string | null>(null)

	async function handleSubmit(event: JSX.TargetedEvent<HTMLFormElement, Event>) {
		event.preventDefault()
		if (status === 'submitting') return

		setStatus('submitting')
		setMessage(null)

		try {
			const response = await fetch(`${import.meta.env.SERVER_URL}/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			})

			const data = (await response.json().catch(() => ({}))) as {
				message?: string
				error?: string
			}

			if (!response.ok) {
				setStatus('error')
				setMessage(data.error ?? `Échec de l'inscription (HTTP ${response.status}).`)
				return
			}

			setStatus('success')
			setMessage(
				data.message ?? "Un email de confirmation vient d'être envoyé. Vérifiez votre boîte de réception.",
			)
			setEmail('')
			setPassword('')
		} catch (err) {
			setStatus('error')
			setMessage(err instanceof Error ? err.message : 'Erreur réseau inconnue.')
		}
	}

	return (
		<section class='mx-auto max-w-md'>
			<div class='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-lg shadow-black/20'>
				<h2 class='text-2xl font-semibold text-zinc-50'>Créer un compte</h2>
				<p class='mt-1 text-sm text-zinc-400'>
					Saisissez votre email et un mot de passe. Vous recevrez un lien de confirmation.
				</p>

				<form class='mt-6 space-y-4' onSubmit={handleSubmit} noValidate>
					<div class='space-y-1'>
						<label
							for='register-email'
							class='block text-xs font-medium uppercase tracking-wider text-zinc-400'
						>
							Email
						</label>
						<input
							id='register-email'
							type='email'
							required
							autoComplete='email'
							value={email}
							onInput={(event) => setEmail((event.target as HTMLInputElement).value)}
							disabled={status === 'submitting'}
							class='w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 disabled:opacity-60'
							placeholder='vous@example.com'
						/>
					</div>

					<div class='space-y-1'>
						<label
							for='register-password'
							class='block text-xs font-medium uppercase tracking-wider text-zinc-400'
						>
							Mot de passe
						</label>
						<input
							id='register-password'
							type='password'
							required
							minLength={PASSWORD_MIN_LENGTH}
							autoComplete='new-password'
							value={password}
							onInput={(event) => setPassword((event.target as HTMLInputElement).value)}
							disabled={status === 'submitting'}
							class='w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 disabled:opacity-60'
							placeholder={`Au moins ${PASSWORD_MIN_LENGTH} caractères`}
						/>
					</div>

					<button
						type='submit'
						disabled={status === 'submitting'}
						class='w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60'
					>
						{status === 'submitting' ? 'Envoi en cours…' : "S'inscrire"}
					</button>
				</form>

				{status === 'success' && message && (
					<div class='mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200'>
						{message}
					</div>
				)}

				{status === 'error' && message && (
					<div class='mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200'>
						{message}
					</div>
				)}
			</div>
		</section>
	)
}
