import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is set by the GitHub Pages workflow to "/<repo>/".
// Cloudflare Pages and local dev leave it unset → served from "/".
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
