import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]] !== undefined) continue
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const connectionString = process.env.DATABASE_URL
if (!connectionString || /YOUR_PASSWORD|YOUR_PROJECT_REF/.test(connectionString)) {
  console.error('[MIGRATE] DATABASE_URL is missing or still a placeholder in .env')
  process.exit(1)
}

const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(connectionString)
const client = new pg.Client({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
})

const dir = path.resolve('migrations')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

await client.connect()
try {
  for (const file of files) {
    console.log(`[MIGRATE] Running ${file}`)
    await client.query(fs.readFileSync(path.join(dir, file), 'utf8'))
  }
  console.log('[MIGRATE] Done')
} finally {
  await client.end()
}
