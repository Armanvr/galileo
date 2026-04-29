import { useEffect, useState } from 'preact/hooks'

/**
 * Snapshot of the current URL that the mini-router exposes to components.
 */
export interface RouteState {
	path: string
	search: string
}

function getCurrentRoute(): RouteState {
	if (typeof window === 'undefined') {
		return { path: '/', search: '' }
	}
	return { path: window.location.pathname, search: window.location.search }
}

type RouteListener = (route: RouteState) => void
const listeners = new Set<RouteListener>()

function emit(): void {
	const route = getCurrentRoute()
	for (const listener of listeners) {
		listener(route)
	}
}

if (typeof window !== 'undefined') {
	window.addEventListener('popstate', emit)
}

/**
 * Programmatically update the URL and notify every `useRoute` subscriber.
 * Falls back to `location.assign` when the target is not a same-origin path.
 */
export function navigate(to: string): void {
	if (typeof window === 'undefined') return
	if (!to.startsWith('/')) {
		window.location.assign(to)
		return
	}
	window.history.pushState({}, '', to)
	emit()
}

/**
 * Preact hook that re-renders the component when the URL changes.
 */
export function useRoute(): RouteState {
	const [route, setRoute] = useState<RouteState>(getCurrentRoute)

	useEffect(() => {
		listeners.add(setRoute)
		setRoute(getCurrentRoute())
		return () => {
			listeners.delete(setRoute)
		}
	}, [])

	return route
}
