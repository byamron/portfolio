import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Base is passed at build time via `--base=/consensus/` (see root package.json's
// build:consensus script) so `npm run dev` here still serves from `/`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
