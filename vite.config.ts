import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [preact(), tailwindcss()],
	// Also expose SERVER_URL to the client (on top of the default VITE_ prefix).
	// Keep this list narrow: anything matching these prefixes is bundled into
	// the client code and is therefore public.
	envPrefix: ['VITE_', 'SERVER_URL'],
})
