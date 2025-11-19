import { pool } from "../utils/db.js";
import { Request, Response } from "express"


export const FetchStudents = async (req: Request, res: Response) => {
  const { xYear, xTerm, sClass, sRoom } = req.query
  const { schoolID } = req.user!
  const sClassVal = sClass === "all" ? null : sClass
  const sRoomVal = sRoom === "all" ? null : sRoom

  try {
    let sql = `
              SELECT 
                u.id, u.sCitizenID, u.sID, u.sPassword, u.sPrefix, u.sFirstname, u.sLastname,
                u.sStatus, u.schoolID, u.cardRFID, u.cardMfd, u.cardExd,
                c.id as classroomId, c.sClass, c.sRoom, c.sNo, c.xYear, c.xTerm
              FROM tb_classroom c
              LEFT JOIN tb_students u ON c.sID = u.sID AND u.schoolID = ?
              WHERE c.schoolID = ?
            `
    const params: any[] = [schoolID, schoolID]

    if (xYear) {
      sql += " AND c.xYear = ?"
      params.push(xYear)
    }
    if (xTerm) {
      sql += " AND c.xTerm = ?"
      params.push(xTerm)
    }
    if (sClassVal) {
      sql += " AND c.sClass = ?"
      params.push(sClassVal)
    }
    if (sRoomVal) {
      sql += " AND c.sRoom = ?"
      params.push(sRoomVal)
    }

    sql += " ORDER BY c.sClass ASC, c.sRoom ASC, c.sNo ASC"

    const [rows] = await pool.query(sql, params)


    res.json(rows);
  } catch (error) {
    console.error("❌ mysql2 error:", error)
    res.status(500).json({ error: "Failed to fetch students" })
  }
}

export const FetchStudentsPublic = async (req: Request, res: Response) => {
  const { xYear, xTerm, sClass, sRoom, schoolID } = req.query

  const sClassVal = sClass === "all" ? null : sClass
  const sRoomVal = sRoom === "all" ? null : sRoom

  try {
    let sql = `
              SELECT 
                u.sID, u.sPrefix, u.sFirstname, u.sLastname,
                c.sClass, c.sRoom, c.sNo, c.xYear, c.xTerm
              FROM tb_classroom c
              LEFT JOIN tb_students u ON c.sID = u.sID AND u.schoolID = ?
              WHERE c.schoolID = ?
            `
    const params: any[] = [schoolID, schoolID]

    if (xYear) {
      sql += " AND c.xYear = ?"
      params.push(xYear)
    }
    if (xTerm) {
      sql += " AND c.xTerm = ?"
      params.push(xTerm)
    }
    if (sClassVal) {
      sql += " AND c.sClass = ?"
      params.push(sClassVal)
    }
    if (sRoomVal) {
      sql += " AND c.sRoom = ?"
      params.push(sRoomVal)
    }

    sql += " ORDER BY c.sClass ASC, c.sRoom ASC, c.sNo ASC"

    const [rows] = await pool.query(sql, params)
    res.json(rows);
  } catch (error) {
    console.error("❌ mysql2 error:", error)
    res.status(500).json({ error: "Failed to fetch students" })
  }
}

export const EditStudent = async (req: Request, res: Response) => {
  const { id, sCitizenID, sPrefix, sFirstname, sLastname, sID } = req.body.data
  const { schoolID } = req.user!
  try {
    const [result] = await pool.query(
      `
              UPDATE db_students.tb_students 
              SET 
                sCitizenID = ?,
                sPrefix = ?,
                sFirstname = ?,
                sLastname = ?,
                sID = ?
              WHERE 
                id = ?
                AND schoolID = ?
          `,
      [sCitizenID, sPrefix, sFirstname, sLastname, sID, id, schoolID]
    )
    res.status(200).json({ message: "แก้ไขข้อมูลนักเรียน สำเร็จ!" })
    return
  } catch (error) {
    console.error("❌ mysql2 error:", error)
    res.status(500).json({ message: "แก้ไขข้อมูลนักเรียน ไม่สำเร็จ!" })
    return
  }
}