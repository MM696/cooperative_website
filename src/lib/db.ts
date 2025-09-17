import pkg from 'pg'
const { Pool } = pkg

// 🔧 Check and fail loudly if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  console.error('\n[DB] ❌ FATAL: DATABASE_URL is not set!\n')
  throw new Error('DATABASE_URL is not set. Did you forget to create .env.local and restart Next.js?')
} else {
  // Hide password when logging
  const safeUrl = process.env.DATABASE_URL.replace(/:\/\/(.*?):(.*?)@/, '://****:****@')
  console.log(`[DB] ✅ DATABASE_URL found: ${safeUrl}`)
}

// ✅ Create a connection pool (recommended for Next.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Supabase needs SSL in production
})

// Try connecting once when the app starts
pool.connect()
  .then(() => console.log('[DB] ✅ Connected successfully'))
  .catch((err) => {
    console.error('[DB] ❌ Connection error:', err.message)
    throw err // Stop execution if DB connection fails
  })

// Export a helper to run queries
export const query = async (text: string, params?: any[]) => {
  console.log(`[DB] 📝 Running query: ${text} with params: ${JSON.stringify(params)}`)
  return pool.query(text, params)
}
