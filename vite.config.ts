import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const STATE_FILE = path.resolve(import.meta.dirname, '.data/campus-state.json')
const PUBLIC_STATE_FILE = path.resolve(
  import.meta.dirname,
  'public/campus-state.json',
)

function campusStateApi(): Plugin {
  return {
    name: 'campus-state-api',
    configureServer(server) {
      server.middlewares.use('/api/campus-state', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            if (!fs.existsSync(STATE_FILE)) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'No published map yet' }))
              return
            }
            const raw = fs.readFileSync(STATE_FILE, 'utf8')
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-store')
            res.end(raw)
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : 'Read failed',
              }),
            )
          }
          return
        }

        if (req.method === 'PUT' || req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (chunk) => {
            chunks.push(Buffer.from(chunk))
          })
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf8')
              const parsed = JSON.parse(body)
              const pretty = `${JSON.stringify(parsed, null, 2)}\n`
              fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
              fs.writeFileSync(STATE_FILE, pretty, 'utf8')
              fs.mkdirSync(path.dirname(PUBLIC_STATE_FILE), { recursive: true })
              fs.writeFileSync(PUBLIC_STATE_FILE, pretty, 'utf8')
              res.statusCode = 204
              res.end()
            } catch (error) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error:
                    error instanceof Error ? error.message : 'Invalid JSON',
                }),
              )
            }
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), campusStateApi()],
  server: {
    host: true,
    port: 5173,
  },
})
