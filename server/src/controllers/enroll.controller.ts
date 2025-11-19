import { pool } from "../utils/db.js";
import e, { Request, Response } from "express"

import { RowDataPacket } from "mysql2";

interface CurRow extends RowDataPacket {
    curID: number;
}

export const FetchConfig = async (req: Request, res: Response) => {
    const { year, term } = req.query
    const { schoolID } = req.user!

    try {
        const sql = `
                    SELECT 
                        a.*, 
                        b.curName
                    FROM 
                        db_enroll.tb_config a
                    LEFT JOIN db_enroll.tb_curriculum b ON a.curID = b.curID
                    WHERE 
                        a.schoolID = ?
                        AND a.xYear = ?
                        AND a.xTerm = ?
                    ORDER BY
                        a.xClass ASC
                    `
        const [rows] = await pool.query(sql, [schoolID, year, term])
        res.json(rows);
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "Failed to fetch curriculums" })
        return
    }
}

export const AssignConfig = async (req: Request, res: Response) => {
    const { year, term } = req.body
    const { schoolID } = req.user!

    const filterYear = term === "1" ? Number(year) - 1 : year
    const filterTerm = term === "2" ? "1" : term

    try {
        const [result] = await pool.query(
            `
                INSERT INTO db_enroll.tb_config(schoolID, xYear, xTerm, xClass, curID, xMaxAddCr2, xOpenEnroll)
                SELECT ?, ?, ?, xClass, curID, 0, 0
                FROM db_enroll.tb_config
                WHERE 
                    schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                ORDER BY xClass ASC
            `,
            [schoolID, year, term, schoolID, filterYear, filterTerm]
        )

        res.status(200).json({ message: "กำหนดหลักสูตรที่ใช้ สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "กำหนดหลักสูตรที่ใช้ ไม่สำเร็จ!" })
        return
    }
}

export const CancelConfig = async (req: Request, res: Response) => {
    const { year, term } = req.body
    const { schoolID } = req.user!

    try {
        const [result] = await pool.query(
            `
                DELETE FROM db_enroll.tb_config 
                WHERE 
                    schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
            `,
            [schoolID, year, term]
        )

        res.status(200).json({ message: "ยกเลิกหลักสูตรที่ใช้ สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "ยกเลิกหลักสูตรที่ใช้ ไม่สำเร็จ!" })
        return
    }
}

export const EditConfig = async (req: Request, res: Response) => {
    const { year, term, classroom, curID } = req.body
    const { schoolID } = req.user!

    const classNumber = classroom?.match(/\d+/)?.[0] ?? ""

    try {
        const [result] = await pool.query(
            `
                UPDATE db_enroll.tb_config 
                SET curID = ?
                WHERE 
                    schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                    AND xClass = ?
            `,
            [curID, schoolID, year, term, classNumber]
        )

        res.status(200).json({ message: "แก้ไขหลักสูตรที่ใช้ สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "แก้ไขหลักสูตรที่ใช้ ไม่สำเร็จ!" })
        return
    }
}

export const ToggleOpenEnroll = async (req: Request, res: Response) => {
    const { year, term, classroom, xOpenEnroll } = req.body
    const { schoolID } = req.user!

    const classNumber = classroom?.match(/\d+/)?.[0] ?? ""
    const text = xOpenEnroll == 1 ? "เปิด" : "ปิด"
    try {
        const [result] = await pool.query(
            `
                UPDATE db_enroll.tb_config 
                SET xOpenEnroll = ?
                WHERE 
                    schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                    AND xClass = ?
            `,
            [xOpenEnroll, schoolID, year, term, classNumber]
        )
        res.status(200).json({ message: `${text} ลงทะเบียน สำเร็จ!` })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: `${text} ลงทะเบียน ไม่สำเร็จ!` })
        return
    }
}

export const AssignConfigMaxAddCr2 = async (req: Request, res: Response) => {
    const { year, term } = req.body
    const { schoolID } = req.user!

    const filterYear = Number(year) - 1

    try {
        const [result] = await pool.query(
            `
                INSERT INTO db_enroll.tb_config (
                    schoolID, xYear, xTerm, xClass, curID, xMaxAddCr2, xOpenEnroll
                )
                SELECT 
                    ?, ?, ?, xClass, curID, xMaxAddCr2, 0 AS xOpenEnroll
                FROM db_enroll.tb_config
                WHERE 
                    schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                ORDER BY xClass ASC
                ON DUPLICATE KEY UPDATE
                    xMaxAddCr2 = VALUES(xMaxAddCr2)
            `,
            [schoolID, year, term, schoolID, filterYear, term]
        )

        res.status(200).json({ message: "กำหนดหลักสูตรที่ใช้ สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "กำหนดหลักสูตรที่ใช้ ไม่สำเร็จ!" })
        return
    }
}

export const EditConfigMaxAddCr2 = async (req: Request, res: Response) => {
    const { year, term, classroom, xMaxAddCr2 } = req.body
    const { schoolID } = req.user!

    const classNumber = classroom?.match(/\d+/)?.[0] ?? ""

    try {
        const [result] = await pool.query(
            `
                UPDATE db_enroll.tb_config 
                SET xMaxAddCr2 = ?
                WHERE 
                    schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
                    AND xClass = ?
            `,
            [xMaxAddCr2, schoolID, year, term, classNumber]
        )

        res.status(200).json({ message: "แก้ไขหน่วยกิตวิชาเพิ่มเติม กลุ่ม 2 สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "แก้ไขหน่วยกิตวิชาเพิ่มเติม กลุ่ม 2 ไม่สำเร็จ!" })
        return
    }
}

export const CancelConfigMaxAddCr2 = async (req: Request, res: Response) => {
    const { year, term } = req.body
    const { schoolID } = req.user!

    try {
        const [result] = await pool.query(
            `
                UPDATE db_enroll.tb_config 
                    SET xMaxAddCr2 = 0
                WHERE 
                    schoolID = ?
                    AND xYear = ?
                    AND xTerm = ?
            `,
            [schoolID, year, term]
        )

        res.status(200).json({ message: "ยกเลิกหน่วยกิตวิชาเพิ่มเติม กลุ่ม 2 สำเร็จ!" })
        return
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "ยกเลิกหน่วยกิตวิชาเพิ่มเติม กลุ่ม 2 ไม่สำเร็จ!" })
        return
    }
}

export const FetchManageSubjects = async (req: Request, res: Response) => {
    const { year, term, classroom, type } = req.query
    const { schoolID } = req.user!

    try {
        const sqlcurID = `
                    SELECT curID
                    FROM db_enroll.tb_config
                    WHERE schoolID = ? AND xYear = ? AND xTerm = ? AND xClass = ?
                    LIMIT 1
                    `;
        const [curRows] = await pool.query<CurRow[]>(sqlcurID, [schoolID, year, term, classroom]);

        if (curRows.length === 0) {
            res.status(200).json({ message: "ไม่พบข้อมูลหลักสูตรของปี/ภาคเรียนนี้" })
        }

        const curID = curRows[0].curID;

        let subType = ""
        let whereExtra = "";
        let params = [schoolID, year, term, classroom, curID];

        if (type === "core") {
            subType = "'1', '2', '5'";
            whereExtra = `AND a.subClass = ? AND a.subTerm = ?`;
            params.push(classroom, term);
        } else {
            subType = "'3', '4'";
        }

        const sql = `
                    SELECT 
                        a.id, 
                        a.subID, 
                        a.subName, 
                        a.subIDEng,
                        a.subNameEng,
                        a.subType,
                        CASE
                            WHEN a.subType = '1' THEN 'พื้นฐาน'
                            WHEN a.subType = '2' THEN 'เพิ่มเติมกลุ่ม 1'
                            WHEN a.subType = '3' THEN 'เพิ่มเติมกลุ่ม 1 (ภาษา)'
                            WHEN a.subType = '4' THEN 'เพิ่มเติมกลุ่ม 2'
                            WHEN a.subType = '5' THEN 'กิจกรรม'
                        END AS subTypeName,
                        a.subCategory,
                        CASE
                            WHEN a.subCategory = '1' THEN 'หมวด ก'
                            WHEN a.subCategory = '2' THEN 'หมวด ข'
                            WHEN a.subCategory = '3' THEN 'หมวด ค'
                            ELSE ''
                        END AS subCategoryName,
                        a.subCr,

                        EXISTS (
                            SELECT 1
                            FROM db_enroll.tb_sections s
                            WHERE 
                                s.schoolID = ?
                                AND s.xYear = ?
                                AND s.xTerm = ?
                                AND s.xClass = ?
                                AND s.sub_id = a.id
                            LIMIT 1
                        ) AS xOpenSubject

                    FROM 
                        db_enroll.tb_subjects AS a

                    WHERE
                        a.subCur = ?
                        ${whereExtra}
                        AND a.subType IN (${subType})

                    ORDER BY
                        a.subType ASC,
                        a.subCategory ASC
                    `
        const [rows] = await pool.query(sql, params)
        res.json(rows);
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "Failed to fetch subjects" })
        return
    }
}

export const ToggleOpenSubject = async (req: Request, res: Response) => {
    const { year, term, classroom, group, id, xOpenSubject } = req.body;
    const { schoolID } = req.user!;

    const text = xOpenSubject == 1 ? "จัด" : "ยกเลิก";
    const limit = 24;
    try {
        if (xOpenSubject == 1) {

            const values = [];
            for (let i = 1; i <= group; i++) {
                values.push([schoolID, year, term, classroom, id, i, limit, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }

            await pool.query(
                `
                INSERT INTO db_enroll.tb_sections
                (schoolID, xYear, xTerm, xClass, sub_id, xGroup, xLimit, xCurrent_Count, maxScore1, maxScore2, maxScore3, maxScore4, maxScore5, maxScoreMid, maxScore6, maxScore7, maxScore8, maxScore9, maxScore10, maxScoreFinal)
                VALUES ?
                ON DUPLICATE KEY UPDATE
                    xGroup = VALUES(xGroup)
            `,
                [values]
            );

        } else {
            await pool.query(
                `
                DELETE FROM db_enroll.tb_sections
                WHERE 
                    schoolID = ? 
                    AND xYear = ? 
                    AND xTerm = ? 
                    AND xClass = ?
                    AND sub_id = ?
                `,
                [schoolID, year, term, classroom, id]
            );
        }

        res.status(200).json({ message: `${text}วิชาเรียน สำเร็จ!` });
        return;

    } catch (error) {
        console.error("❌ mysql2 error:", error);
        res.status(500).json({ message: `ดำเนินการ ไม่สำเร็จ!` });
        return;
    }
}

export const FetchManageSections = async (req: Request, res: Response) => {
    const { year, term, classroom } = req.query
    const { schoolID } = req.user!
    try {
        const sql = `
                    SELECT 
                        b.subID, 
                        b.subName, 
                        b.subIDEng,
                        b.subNameEng,
                        b.subType,
                        CASE
                            WHEN b.subType = '1' THEN 'พื้นฐาน'
                            WHEN b.subType = '2' THEN 'เพิ่มเติมกลุ่ม 1'
                            WHEN b.subType = '3' THEN 'เพิ่มเติมกลุ่ม 1 (ภาษา)'
                            WHEN b.subType = '4' THEN 'เพิ่มเติมกลุ่ม 2'
                            WHEN b.subType = '5' THEN 'กิจกรรม'
                        END AS subTypeName,
                        b.subCategory,
                        CASE
                            WHEN b.subCategory = '1' THEN 'หมวด ก'
                            WHEN b.subCategory = '2' THEN 'หมวด ข'
                            WHEN b.subCategory = '3' THEN 'หมวด ค'
                            ELSE ''
                        END AS subCategoryName,
                        b.subCr,
                        a.xGroup,
                        a.xLimit
                    FROM 
                        db_enroll.tb_sections AS a
                    LEFT JOIN 
                        db_enroll.tb_subjects AS b
                    ON a.sub_id = b.id
                    WHERE
                        a.schoolID = ? 
                        AND a.xYear = ? 
                        AND a.xTerm = ? 
                        AND a.xClass = ?
                    ORDER BY
                        b.subType ASC,
                        b.subCategory ASC,
                        b.subID ASC,
                        a.xGroup ASC
                    `
        const [rows] = await pool.query(sql, [schoolID, year, term, classroom])
        res.json(rows);
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "Failed to fetch subjects" })
        return
    }
}

export const FetchManageSectionsTeachers = async (req: Request, res: Response) => {
    const { year, term, classroom } = req.query
    const { schoolID } = req.user!
    try {
        const sql = `
                   SELECT 
                        b.subID, 
                        b.subName, 
                        b.subIDEng,
                        b.subNameEng,
                        b.subType,
                        CASE
                            WHEN b.subType = '1' THEN 'พื้นฐาน'
                            WHEN b.subType = '2' THEN 'เพิ่มเติมกลุ่ม 1'
                            WHEN b.subType = '3' THEN 'เพิ่มเติมกลุ่ม 1 (ภาษา)'
                            WHEN b.subType = '4' THEN 'เพิ่มเติมกลุ่ม 2'
                            WHEN b.subType = '5' THEN 'กิจกรรม'
                        END AS subTypeName,

                        b.subCategory,
                        CASE
                            WHEN b.subCategory = '1' THEN 'หมวด ก'
                            WHEN b.subCategory = '2' THEN 'หมวด ข'
                            WHEN b.subCategory = '3' THEN 'หมวด ค'
                            ELSE ''
                        END AS subCategoryName,

                        b.subCr,
                        a.xGroup,
                        a.xLimit,

                        GROUP_CONCAT(
                            CONCAT('ครู', t.tFirstname, ' ', t.tLastname)
                            ORDER BY t.tID
                            SEPARATOR ', '
                        ) AS tName

                    FROM 
                        db_enroll.tb_sections AS a

                    LEFT JOIN 
                        db_enroll.tb_subjects AS b
                    ON b.id = a.sub_id

                    LEFT JOIN 
                        db_enroll.tb_sections_teachers AS st
                    ON 
                        st.schoolID = a.schoolID
                        AND st.xYear = a.xYear
                        AND st.xTerm = a.xTerm
                        AND st.xClass = a.xClass
                        AND st.sub_id = a.sub_id
                        AND st.xGroup = a.xGroup

                    LEFT JOIN 
                        db_teachers.tb_teachers AS t
                    ON t.tID = st.tID

                    WHERE
                        a.schoolID = ?
                    AND a.xYear     = ?
                    AND a.xTerm     = ?
                    AND a.xClass    = ?

                    GROUP BY
                        a.secID,
                        b.subID, 
                        b.subName, 
                        b.subIDEng,
                        b.subNameEng,
                        b.subType, 
                        b.subCategory, 
                        b.subCr,
                        a.xGroup, 
                        a.xLimit

                    ORDER BY
                        b.subType,
                        b.subCategory,
                        b.subID,
                        a.xGroup
                    `
        const [rows] = await pool.query(sql, [schoolID, year, term, classroom])
        res.json(rows);
    } catch (error) {
        console.error("❌ mysql2 error:", error)
        res.status(500).json({ message: "Failed to fetch subjects" })
        return
    }
}