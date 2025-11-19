import { pool } from "../utils/db.js";
import { Request, Response } from "express"


export const FetchTeachers = async (req: Request, res: Response) => {
  const { schoolID } = req.user!
  try {
    const sql = `
                SELECT * FROM db_teachers.tb_teachers 
                WHERE schoolID = ?
                ORDER BY 
                  tPosition ASC,
                  tFirstname ASC,
                  tLastname ASC
                `
    const [rows] = await pool.query(sql, [schoolID])
    res.json(rows);
  } catch (error) {
    console.error("❌ mysql2 error:", error)
    res.status(500).json({ message: "Failed to fetch teachers" })
    return
  }
}
