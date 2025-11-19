import mysql, { Pool, ResultSetHeader } from "mysql2/promise"

// ดึงค่าจาก ENV ของ container (Docker Compose จะยัดให้ตอนรัน)
export const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// helper type
export type SqlResult = ResultSetHeader
