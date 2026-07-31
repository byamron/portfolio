import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const here = dirname(fileURLToPath(import.meta.url))

/**
 * Injects flow's click-to-pin annotation overlay for design review.
 *
 * The layer is a self-contained <style> + <script> partial from flow
 * (`tools/annotation-layer-v2.html`, branch claude/flow-design-workflow-3a9392)
 * that flow's verify-build skill drops before </body> on any reviewable page.
 * Here it goes onto the live app rather than a static report, so pins land on
 * the real interactive thing — you can set the specimen, then pin the result.
 *
 * Dev-only and opt-in via `npm run dev:annotate`, so the normal dev server and
 * every production build stay completely free of it.
 */
function annotationLayer(): Plugin {
  return {
    name: 'specimen:annotation-layer',
    apply: 'serve',
    transformIndexHtml(html) {
      if (process.env.ANNOTATE !== '1') return html

      // Graceful, matching flow's own contract: if the partial can't be read,
      // serve the app un-annotated with a warning rather than failing the boot.
      try {
        const layer = readFileSync(resolve(here, 'tools/annotation-layer-v2.html'), 'utf8')
        return html.replace('</body>', `${layer}\n  </body>`)
      } catch (err) {
        console.warn('⚠️  annotation layer not injected:', (err as Error).message)
        return html
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), annotationLayer()],
  server: { port: 5199, strictPort: true },
})
