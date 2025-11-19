import { pool } from "../utils/db.js";
import { Request, Response } from "express"


export const FetchScore = async (req: Request, res: Response) => {
  const { subject, group } = req.query
  const { schoolID } = req.user!
  try {
    const [rows] = await pool.query(
      `
        SELECT
            a.xYear,
            a.xTerm,
            a.schoolID,
            a.subjectID,
            a.xClass,
            a.xGroup,
            a.sID,
            a.score1, a.score2, a.score3, a.score4, a.score5,
            a.scoreMid, a.score6, a.score7, a.score8, a.score9, a.score10,
            a.scoreFinal, a.scorePercent, a.grade,
            a.remark,
            CONCAT(b.sFirstname, ' ', b.sLastname) AS fullname,
            c.sNo
        FROM db_enroll.tb_register a
        LEFT JOIN tb_students b ON a.sID = b.sID
        LEFT JOIN (
            SELECT sID, sClass, sNo
            FROM tb_classroom
            WHERE schoolID = ? AND xYear = 2568 AND xTerm = 1
        ) c ON a.sID = c.sID
        WHERE a.schoolID = ? AND a.subjectID = ? AND a.xGroup = ?
        ORDER BY c.sClass ASC, c.sNo ASC
      `,
      [schoolID, schoolID, subject ?? null, group ?? null]
    )

    // ✅ แปลงค่า null → "" และ "10.0" → 10
    const cleanRows = (rows as any[]).map(r => {
      const convert = (v: any) => {
        if (v === null || v === undefined) return ""
        const num = Number(v)
        // ถ้าไม่ใช่ตัวเลข (เช่น remark หรือ text) → คืนค่าดั้งเดิม
        if (isNaN(num)) return v
        // ถ้าเป็นจำนวนเต็ม → แปลงให้เป็น int เช่น 10.0 → 10
        return Number.isInteger(num) ? parseInt(num.toString(), 10) : num
      }

      return {
        ...r,
        score1: convert(r.score1),
        score2: convert(r.score2),
        score3: convert(r.score3),
        score4: convert(r.score4),
        score5: convert(r.score5),
        scoreMid: convert(r.scoreMid),
        score6: convert(r.score6),
        score7: convert(r.score7),
        score8: convert(r.score8),
        score9: convert(r.score9),
        score10: convert(r.score10),
        scoreFinal: convert(r.scoreFinal),
        scorePercent: r.scorePercent,
        grade: convert(r.grade),
        remark: convert(r.remark),
      }
    })

    res.json(cleanRows)
  } catch (error) {
    console.error("❌ mysql2 error:", error)
    res.status(500).json({ error: "Failed to fetch students" })
  }
}

export const SaveScore = async (req: Request, res: Response): Promise<void> => {
  const { scores } = req.body
  const { schoolID } = req.user!
  
  if (!scores || !Array.isArray(scores) || scores.length === 0) {
    res.status(400).json({ error: "Missing or invalid scores data" })
    return
  }

  const values = scores.map((s: any) => [
    s.xYear, s.xTerm, schoolID, s.subjectID, s.xClass, s.xGroup, s.sID, 
    s.score1, s.score2, s.score3, s.score4, s.score5, s.scoreMid, 
    s.score6, s.score7, s.score8, s.score9, s.score10, s.scoreFinal, 
    s.scorePercent, s.grade, s.remark ,
  ])

  try {
    const [result] = await pool.query(
      `
      INSERT INTO db_enroll.tb_register
        (xYear, xTerm, schoolID, subjectID, xClass, xGroup, sID, 
         score1, score2, score3, score4, score5, scoreMid,
         score6, score7, score8, score9, score10, scoreFinal, 
         scorePercent, grade, remark)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        score1=VALUES(score1), score2=VALUES(score2), score3=VALUES(score3), score4=VALUES(score4), score5=VALUES(score5), scoreMid=VALUES(scoreMid),
        score6=VALUES(score6), score7=VALUES(score7), score8=VALUES(score8), score9=VALUES(score9), score10=VALUES(score10), scoreFinal=VALUES(scoreFinal), 
        scorePercent=VALUES(scorePercent), grade=VALUES(grade), remark=VALUES(remark)
      `,
      [values]
    )

    res.json({
      success: true,
      message: "Scores updated successfully",
      affectedRows: (result as any).affectedRows,
    })
  } catch (error) {
    console.error("❌ MySQL error:", error)
    res.status(500).json({ error: "Failed to update scores" })
  }
}
