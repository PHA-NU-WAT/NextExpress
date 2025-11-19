import { pool,SqlResult  } from "../utils/db.js";
import { Request, Response } from "express"


export const StudentPromotion = async (req: Request, res: Response) => {
    const { year, term, classroom, room } = req.body
    const { schoolID } = req.user!
    if (term == "2") {
        try {
            const [result] = await pool.query(
                `
                INSERT IGNORE INTO tb_classroom(schoolID, sID, sClass, sRoom, sNo, xYear, xTerm)
                SELECT
                    schoolID, 
                    sID, 
                    sClass, 
                    sRoom, 
                    sNo, 
                    ? AS xYear, 
                    2 AS xTerm
                FROM
                    tb_classroom a
                WHERE
                    a.schoolID = ?
                    AND a.xYear = ?
                    AND a.xTerm = 1
                    AND a.sClass = ?
                    AND a.sRoom = ?
                `,
                [year, schoolID, year, classroom, room]
            )
            res.status(200).json({ message: "นำเข้าจากภาคเรียนที่ 1 สำเร็จ!" })
            return
        } catch (error) {
            console.error("❌ mysql2 error:", error)
            res.status(500).json({ error: "Failed to fetch students" })
            return
        }
    } else if (classroom == "1" || classroom == "4") {
        res.status(200).json({ message: "นำเข้าจากนักเรียนใหม่!" })
    } else {
        try {
            const previousYear = Number(year) - 1
            const [result] = await pool.query(
                `
                INSERT IGNORE INTO tb_classroom (
                    schoolID, sID, sClass, sRoom, sNo, xYear, xTerm
                )
                SELECT
                    a.schoolID,
                    a.sID,
                    a.sClass + 1,
                    a.sRoom,
                    a.sNo,
                    ? AS xYear,
                    1 AS xTerm
                FROM tb_classroom a
                WHERE a.schoolID = ?
                    AND a.xYear = ?
                    AND a.xTerm = 2
                    AND a.sClass = ?
                    AND a.sRoom = ?
                `,
                [year, schoolID, previousYear, classroom, room]
            )

            res.status(200).json({ message: "นำเข้าจากปีก่อนหน้า สำเร็จ!" })
            return
        } catch (error) {
            console.error("❌ mysql2 error:", error)
            res.status(500).json({ error: "Failed to promote students" })
            return
        }
    }

}

export const ClassroomAssign = async (req: Request, res: Response) => {
    const { year, term, classroom, room, sid } = req.body
    const { schoolID } = req.user!
    try {

        if (!Array.isArray(sid) || sid.length === 0) {
            return res.status(400).json({ message: "กรุณาระบุรหัสนักเรียน" })
        }

        const sidList: string[] = Array.isArray(sid) ? sid : []
        if (sidList.length === 0) {
            return res.status(400).json({ message: "กรุณาระบุรหัสนักเรียน" })
        }

        // สร้าง placeholder สำหรับ IN (?, ?, ?, ...)
        const placeholders = sidList.map(() => "?").join(", ")

        const sql = `
                    INSERT IGNORE INTO tb_classroom
                        (schoolID, sID, sClass, sRoom, sNo, xYear, xTerm)
                    SELECT
                        ?, sID, ?, ?, 0, ?, ?
                    FROM
                        tb_students
                    WHERE
                        sID IN (${placeholders})
                    `
        console.log(sql)
        const params = [schoolID, classroom, room, year, term, ...sidList]

        const [result] = await pool.query<SqlResult>(sql, params)

        res.status(200).json({ message: `จัดนักเรียนเข้าชั้นสำเร็จ! เพิ่มข้อมูล ${result.affectedRows} แถว` })
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "จัดนักเรียนเข้าชั้น ไม่สำเร็จ!" })
        return
    }
}

export const CancelClassroomAssign = async (req: Request, res: Response) => {
    const { year, term, classroom, room } = req.body
    const { schoolID } = req.user!
    try {
        const [result] = await pool.query(
            `
                DELETE FROM tb_classroom
                WHERE schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                    AND sClass = ?
                    AND sRoom = ?
            `,
            [schoolID, year, term, classroom, room]
        )

        res.status(200).json({ message: "ยกเลิกจัดห้อง สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "ยกเลิกจัดห้อง ไม่สำเร็จ!" })
        return
    }
}

export const SeatNoAssign = async (req: Request, res: Response) => {
    const { year, term, classroom, room } = req.body
    const { schoolID } = req.user!
    try {
        const [result] = await pool.query(
            `
                UPDATE tb_classroom AS c
                JOIN (
                SELECT 
                    c.id,
                    CASE
                        WHEN u.sPrefix IN ('เด็กชาย','นาย','ด.ช.') THEN 'ช'
                        WHEN u.sPrefix IN ('เด็กหญิง','นางสาว','น.ส.','ด.ญ.') THEN 'ญ'
                        ELSE 'ญ'
                    END AS gender,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            gender ASC, 
                            u.sFirstname COLLATE utf8mb4_thai_520_w2 ASC, 
                            u.sLastname COLLATE utf8mb4_thai_520_w2 ASC
                    ) AS newNo
                FROM tb_classroom AS c
                LEFT JOIN tb_students AS u ON c.sID = u.sID AND u.schoolID = ?
                WHERE c.schoolID = ?
                    AND c.xYear = ?
                    AND c.xTerm = ?
                    AND c.sClass = ?
                    AND c.sRoom = ?
                ) AS t ON c.id = t.id
                SET c.sNo = t.newNo
            `,
            [schoolID, schoolID, year, term, classroom, room]
        )

        res.status(200).json({ message: "จัดเลขที่ สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "จัดเลขที่ ไม่สำเร็จ!" })
        return
    }
}

export const CancelSeatNoAssign = async (req: Request, res: Response) => {
    const { year, term, classroom, room } = req.body
    const { schoolID } = req.user!
    try {
        const [result] = await pool.query(
            `
                UPDATE tb_classroom SET sNo = 0
                WHERE schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                    AND sClass = ?
                    AND sRoom = ?
            `,
            [schoolID, year, term, classroom, room]
        )

        res.status(200).json({ message: "ยกเลิกจัดเลขที่ สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "ยกเลิกจัดเลขที่ ไม่สำเร็จ!" })
        return
    }
}

export const DeleteStudent = async (req: Request, res: Response) => {
    const { year, term, classroom, room, sid } = req.body
    const { schoolID } = req.user!
    try {
        const [result] = await pool.query(
            `
                DELETE FROM tb_classroom
                WHERE schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                    AND sClass = ?
                    AND sRoom = ?
                    AND sID = ?
            `,
            [schoolID, year, term, classroom, room, sid]
        )

        res.status(200).json({ message: "ลบนักเรียน สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "ลบนักเรียน ไม่สำเร็จ!" })
        return
    }
}