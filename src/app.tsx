import { navigate, useRoute } from './lib/router'
import { HomePage } from './pages/home'
import { RegisterPage } from './pages/register'
import { VerifyPage } from './pages/verify'

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
	return (
		<a
			href={to}
			onClick={(event) => {
				event.preventDefault()
				navigate(to)
			}}
			class={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
				active ? 'bg-indigo-500/20 text-indigo-200' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
			}`}
		>
			{label}
		</a>
	)
}

export function App() {
	const { path } = useRoute()

	let page = <HomePage />
	if (path === '/register') page = <RegisterPage />
	else if (path === '/verify') page = <VerifyPage />

	return (
		<main class='min-h-screen bg-zinc-950 text-zinc-100'>
			<div class='mx-auto max-w-7xl px-6 py-12'>
				<header class='mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
					<div class='space-y-2'>
						<h1 class='text-4xl font-bold tracking-tight'>galileo</h1>
						<p class='text-zinc-400'>Catalogue des objets astronomiques référencés par l'API.</p>
					</div>
					<nav class='flex items-center gap-2'>
						<NavLink to='/' label='Accueil' active={path === '/'} />
						<NavLink to='/register' label="S'inscrire" active={path === '/register'} />
					</nav>
				</header>

				{page}
			</div>
		</main>
	)
}
