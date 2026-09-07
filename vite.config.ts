import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Served from https://keijid.github.io/shadoi/ (a project page), so
  // asset URLs need the repo name as a base path in production builds.
  base: command === 'build' ? '/shadoi/' : '/',
  plugins: [react()],
}))
