import { pool, SqlResult } from "../utils/db.js";
import { Request, Response } from "express"


export const FetchCurriculums = async (req: Request, res: Response) => {
    try {
        const sql = `
                    SELECT 
                        curID, 
                        curName,
                        CASE
                            WHEN curLevel = '1' THEN 'มัธยมศึกษาตอนต้น'
                            WHEN curLevel = '2' THEN 'มัธยมศึกษาตอนปลาย'
                        END curLevel,
                        curMinCr, 
                        curBasicCr, 
                        curAddCr1, 
                        curAddCr2, 
                        curAddCr21, 
                        curAddCr22, 
                        curAddCr23, 
                        curActHr, 
                        curUseYear
                    FROM 
                        db_enroll.tb_curriculum
                    `
        const [rows] = await pool.query(sql, [])
        res.json(rows);
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "Failed to fetch curriculums" })
        return
    }
}

export const FetchSubjects = async (req: Request, res: Response) => {
    const { curid } = req.query
    try {
        const sql = `
                    SELECT 
                        subID, 
                        subName, 
                        subIDEng,
                        subNameEng,
                        subType,
                        CASE
                            WHEN subType = '1' THEN 'พื้นฐาน'
                            WHEN subType = '2' THEN 'เพิ่มเติมกลุ่ม 1'
                            WHEN subType = '3' THEN 'เพิ่มเติมกลุ่ม 1 (ภาษา)'
                            WHEN subType = '4' THEN 'เพิ่มเติมกลุ่ม 2'
                            WHEN subType = '5' THEN 'กิจกรรม'
                        END AS subTypeName,
                        subCategory,
                        CASE
                            WHEN subCategory = '1' THEN 'หมวด ก'
                            WHEN subCategory = '2' THEN 'หมวด ข'
                            WHEN subCategory = '3' THEN 'หมวด ค'
                            ELSE ''
                        END AS subCategoryName,
                        subCr,
                        subFile
                    FROM 
                        db_enroll.tb_subjects
                    WHERE
                        subCur = ?
                    ORDER BY
                        subType ASC,
                        subCategory ASC

                    `
        const [rows] = await pool.query(sql, [curid])
        res.json(rows);
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "Failed to fetch subjects" })
        return
    }
}

export const EditCurriculums = async (req: Request, res: Response) => {
    // const { year, term, classroom, curID } = req.body
    console.log(req.body.data)
    res.status(200).json({ message: "รอกแก้ SQL , Data ส่งไปถึงแล้ว" })
    // const { schoolID } = req.user!

    // const classNumber = classroom?.match(/\d+/)?.[0] ?? ""

    // try {
    //     const [result] = await pool.query(
    //         `
    //             UPDATE db_enroll.tb_config 
    //             SET curID = ?
    //             WHERE 
    //                 schoolID = ?
    //                 AND xYear = ?
    //                 AND xTerm = ?
    //                 AND xClass = ?
    //         `,
    //         [curID, schoolID, year, term, classNumber]
    //     )

    //     res.status(200).json({ message: "แก้ไขหลักสูตรที่ใช้ สำเร็จ!" })
    //     return
    // } catch (error) {
    //     console.error("❌ mysql2 error:", error)
    //     res.status(500).json({ message: "แก้ไขหลักสูตรที่ใช้ ไม่สำเร็จ!" })
    //     return
    // }
}

