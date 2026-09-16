import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the built assets resolve correctly regardless of the
// GitHub Pages subpath (https://<user>.github.io/<repo>/). Combined with
// HashRouter for client-side routing, no repo-name configuration is needed.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
