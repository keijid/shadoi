import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Identifies the deployed build. The commit is the comparison key (it changes
 * on every deploy); the timestamp is what the UI shows, since a SHA means
 * nothing to someone just checking whether they are up to date.
 */
function buildInfo() {
  // GitHub Actions sets GITHUB_SHA; fall back to the local checkout.
  let sha = process.env.GITHUB_SHA || ''
  if (!sha) {
    try {
      sha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    } catch {
      sha = ''
    }
  }
  return { version: sha ? sha.slice(0, 7) : 'dev', builtAt: new Date().toISOString() }
}

export default defineConfig(({ command }) => {
  const info = buildInfo()
  const body = JSON.stringify(info)

  return {
    // Served from https://keijid.github.io/shadoi/ (a project page), so
    // asset URLs need the repo name as a base path in production builds.
    base: command === 'build' ? '/shadoi/' : '/',
    define: { __BUILD_INFO__: body },
    plugins: [
      react(),
      {
        // The running app polls this to learn whether a newer build is live.
        name: 'shadoi-version-endpoint',
        generateBundle() {
          this.emitFile({ type: 'asset', fileName: 'version.json', source: body })
        },
        configureServer(server) {
          server.middlewares.use('/version.json', (_req, res) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          })
        },
      },
    ],
  }
})
