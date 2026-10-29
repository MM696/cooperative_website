import fs from 'node:fs'
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

const args = process.argv.slice(2)
const email = args.find((a) => !a.startsWith('--'))
const confirm = args.includes('--confirm')
const includePublicUsers = args.includes('--public-users')

if (!email) {
  console.error('Usage: npm run delete-user -- <email> [--public-users] [--confirm]')
  process.exit(1)
}

// members/admins cascade to their sessions and contributions
const tables = [
  'cooperative.member_signup_tokens',
  'cooperative.admin_signup_tokens',
  'cooperative.members',
  'cooperative.admins',
  ...(includePublicUsers ? ['public.users'] : []),
]

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
try {
  await client.query('BEGIN')
  for (const table of tables) {
    const { rowCount } = await client.query(
      `DELETE FROM ${table} WHERE lower(email) = lower($1)`,
      [email]
    )
    console.log(`${table}: ${rowCount} row(s)`)
  }

  if (confirm) {
    await client.query('COMMIT')
    console.log(`Deleted data for ${email}`)
  } else {
    await client.query('ROLLBACK')
    console.log('Dry run, nothing deleted. Add --confirm to delete.')
  }
} catch (err) {
  await client.query('ROLLBACK')
  console.error(err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
