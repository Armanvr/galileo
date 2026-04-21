/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly SERVER_URL: string
}

// biome-ignore lint/correctness/noUnusedVariables: augments the global ImportMeta type
interface ImportMeta {
	readonly env: ImportMetaEnv
}
