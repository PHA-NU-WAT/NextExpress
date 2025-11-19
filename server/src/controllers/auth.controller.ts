import { pool } from "../utils/db.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

import { OAuth2Client } from "google-auth-library"




interface AppUser {
  id: number;
  year: number;
  term: number;
  schoolID: number;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AppUser;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "HelloChildren";
const GOOGLE_CLIENT = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ✅ Login
export const Login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    let user: any = null;
    let schoolID: number | null = null;
    let userId: number | null = null;
    let userPin: string | null = null;
    let userName: string | null = null;
    let userEmail: string | null = null;
    let userAvatar: string | null = null;
    let userRoles: string[] = [];
    let userPermis: string[] = [];
    let hashedPassword: string | null = null;

    // 🔍 1) ตรวจนักเรียน
    const [studentRows] = await pool.query(
      "SELECT * FROM tb_students WHERE sEmail = ? LIMIT 1",
      [username]
    );
    const student = studentRows as any[];

    if (student.length > 0) {
      const s = student[0];
      user = s;
      schoolID = s.schoolID;
      userId = s.sID;
      userPin = s.sCitizenID;
      userName = s.sPrefix + s.sFirstname + " " + s.sLastname;
      userEmail = s.sEmail;
      userRoles = ["student"];
      hashedPassword = s.sPassword;
    } else {
      // 🔍 2) ตรวจครู
      const [teacherRows] = await pool.query(
        `
        SELECT 
          a.schoolID,
          a.tID,
          a.tCitizenID,
          a.tPrefix,
          a.tFirstname,
          a.tLastname,
          a.tEmail,
          a.tPhoto,
          a.tPassword,
          GROUP_CONCAT(DISTINCT c.role_name) AS roles,
          GROUP_CONCAT(DISTINCT e.permission_name) AS permissions
        FROM db_teachers.tb_teachers a
        LEFT JOIN db_teachers.tb_teacher_roles b ON a.tID = b.tID
        LEFT JOIN db_teachers.tb_roles c ON b.roleID = c.roleID
        LEFT JOIN db_teachers.tb_roles_permissions d ON c.roleID = d.roleID
        LEFT JOIN db_teachers.tb_permissions e ON d.permissionID = e.permissionID
        WHERE a.tEmail = ?
        GROUP BY
          a.tID
        LIMIT 1
        `,
        [username]
      );
      const teacher = teacherRows as any[];



      if (teacher.length > 0) {
        const t = teacher[0];
        user = t;
        schoolID = t.schoolID;
        userId = t.tID;
        userPin = t.tCitizenID;
        userName = `${t.tPrefix}${t.tFirstname} ${t.tLastname}`;
        userEmail = t.tEmail;
        userAvatar = t.tPhoto;
        userRoles =
          typeof t.roles === "string"
            ? t.roles.split(",").map((r: string) => r.trim()).filter(Boolean)
            : [];
        userPermis =
          typeof t.permissions === "string"
            ? t.permissions.split(",").map((p: string) => p.trim()).filter(Boolean)
            : [];
        hashedPassword = t.tPassword;
      }
    }

    // ❌ ไม่เจอ user หรือไม่มีรหัสผ่าน
    if (!user || !hashedPassword || !userId || !userPin) {
      res.status(401).json({ success: false, message: "Invalid username or password" });
      return;
    }

    // ✅ ตรวจรหัสผ่าน (ยังไม่ใช้ bcrypt)
    const isMatch = password === hashedPassword;
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid username or password" });
      return;
    }

    // ✅ สร้าง JWT payload
    const payload: AppUser = {
      id: userId,
      year: 2568,
      term: 2,
      schoolID: schoolID!,
      username: userName!,
      email: userEmail || "",
      avatar: userAvatar || "",
      roles: userRoles,
      permissions: userPermis,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30m" });

    res.json({
      success: true,
      message: "Login Successful",
      token, // 🟢 ส่ง token กลับมาให้ Next.js
      user: payload,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Login ด้วย Google OAuth
export const LoginWithGoogle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_token } = req.body; // <-- มาจาก Next.js
    if (!id_token) {
      res.status(400).json({ success: false, message: "Missing Google id_token" });
      return;
    }

    // ✅ ตรวจสอบ id_token กับ Google
    const ticket = await GOOGLE_CLIENT.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(401).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const email = payload.email;
    const name = payload.name || "";
    const picture = payload.picture || "";

    console.log("✅ Verified Google account:", email);

    // 🔍 ตรวจสอบว่าเป็นนักเรียนหรือครู
    let userId: number | null = null;
    let schoolID: number | null = null;
    let userRoles: string[] = [];
    let userPermis: string[] = [];

    // 1) นักเรียน
    const [studentRows] = await pool.query(
      "SELECT * FROM tb_students WHERE sEmail = ? LIMIT 1",
      [email]
    );
    const student = studentRows as any[];
    if (student.length > 0) {
      const s = student[0];
      userId = s.sID;
      schoolID = s.schoolID;
      userRoles = ["student"];
    } else {
      // 2) ครู
      const [teacherRows] = await pool.query(
        `
        SELECT 
          a.schoolID,
          a.tID,
          GROUP_CONCAT(DISTINCT c.role_name) AS roles,
          GROUP_CONCAT(DISTINCT e.permission_name) AS permissions
        FROM db_teachers.tb_teachers a
        LEFT JOIN db_teachers.tb_teacher_roles b ON a.tID = b.tID
        LEFT JOIN db_teachers.tb_roles c ON b.roleID = c.roleID
        LEFT JOIN db_teachers.tb_roles_permissions d ON c.roleID = d.roleID
        LEFT JOIN db_teachers.tb_permissions e ON d.permissionID = e.permissionID
        WHERE a.tEmail = ?
        GROUP BY a.tID
        LIMIT 1
        `,
        [email]
      );
      const teacher = teacherRows as any[];
      if (teacher.length > 0) {
        const t = teacher[0];
        userId = t.tID;
        schoolID = t.schoolID;
        userRoles =
          typeof t.roles === "string"
            ? t.roles.split(",").map((r: string) => r.trim()).filter(Boolean)
            : [];
        userPermis =
          typeof t.permissions === "string"
            ? t.permissions.split(",").map((p: string) => p.trim()).filter(Boolean)
            : [];
      }
    }

    // ❌ ไม่มีในระบบ
    if (!userId || !schoolID) {
      res.status(403).json({
        success: false,
        message: "บัญชีนี้ยังไม่ได้ลงทะเบียนในระบบโรงเรียน",
      });
      return;
    }

    // ✅ สร้าง payload ของระบบ
    const payloadJwt = {
      id: userId,
      year: 2568,
      term: 2,
      schoolID,
      username: name,
      email,
      avatar: picture,
      roles: userRoles,
      permissions: userPermis,
    };

    // ✅ สร้าง JWT ของระบบ
    const token = jwt.sign(payloadJwt, JWT_SECRET, { expiresIn: "30m" });

    console.log("🎫 Issued JWT for:", email);

    // ✅ ส่งกลับให้ Next.js
    res.json({
      success: true,
      message: "Google Login Successful",
      token,
      payloadJwt,
    });
  } catch (err) {
    console.error("💥 Google Login error:", err);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
}
