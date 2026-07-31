import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Static sub-apps live pre-built under public/ (e.g. public/font-guesser/) and are
// served by GitHub Pages as real directories in production. Vite's dev server instead
// hits the SPA fallback for a bare `/font-guesser/` request, rendering the portfolio.
// This middleware serves the sub-app's index.html for those directory paths in dev so
// localhost matches production. Assets (hashed JS/CSS) already resolve from public/.
function serveStaticSubApps(dirs: string[]): Plugin {
  return {
    name: 'serve-static-sub-apps',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        for (const dir of dirs) {
          if (url === `/${dir}` || url === `/${dir}/`) {
            const indexPath = path.resolve(__dirname, 'public', dir, 'index.html')
            if (fs.existsSync(indexPath)) {
              res.setHeader('Content-Type', 'text/html')
              res.end(fs.readFileSync(indexPath, 'utf-8'))
              return
            }
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [serveStaticSubApps(['font-guesser']), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@playground': path.resolve(__dirname, './ui-playground/src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-lottie': ['lottie-web'],
        },
      },
    },
  },
})
