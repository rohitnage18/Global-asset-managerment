// Database connection utility for PostgreSQL
import { Pool } from "pg"
import { awsConfig } from "./aws-config"

let pool: Pool | null = null

export function getDatabase() {
  if (!pool) {
    pool = new Pool({
      host: awsConfig.rds.host,
      port: awsConfig.rds.port,
      database: awsConfig.rds.database,
      user: awsConfig.rds.username,
      password: awsConfig.rds.password,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const db = getDatabase()
  const start = Date.now()
  try {
    const res = await db.query(text, params)
    const duration = Date.now() - start
    console.log("[Database Query]", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("[Database Error]", { text, error })
    throw error
  }
}
