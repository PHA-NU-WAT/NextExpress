import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

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
interface DecodedToken  {
  id: number;
  year: number;
  term: number;
  schoolID: number;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}
declare module "express-serve-static-core" {
  interface Request {
    user?: AppUser;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "HelloChildren";

// ✅ ตรวจสอบ JWT validity
export const AuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.authToken;
  if (!token) {
    res.status(401).json({ message: "Session expired. Please login again." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AppUser;
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify failed:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const AuthProfile = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.authToken;

  if (!token) {
    res.status(401).json({ success: false, message: "Session expired. Please login again." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded || !decoded.email) {
      res.status(401).json({ success: false, message: "Invalid token structure." });
      return;
    }

    res.json({
      success: true,
      user: {
        id: decoded.id,
        year: decoded.year,
        term: decoded.term,
        schoolID: decoded.username,
        username: decoded.username,
        email: decoded.email,
        avatar: decoded.avatar,
        roles: decoded.roles ?? [],
        permissions: decoded.permissions ?? [],
      },
    });
  } catch (err) {
    console.error("❌ JWT verify error:", err);
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// ✅ ตรวจสอบ role/permission (optional)
export const Authorize = (options: { roles?: string[]; permissions?: string[] }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { roles = [], permissions = [] } = options;
    const roleOk = roles.length === 0 || roles.some((r) => user.roles.includes(r));
    const permOk =
      permissions.length === 0 || permissions.some((p) => user.permissions.includes(p));

    if (roleOk && permOk) {
      next();
      return;
    }

    if (process.env.NODE_ENV === "production") {
      res.status(403).json({ message: "Forbidden" });
    } else {
      res.status(403).json({
        message: "Forbidden",
        requiredRoles: roles,
        requiredPermissions: permissions,
        currentRoles: user.roles,
        currentPermissions: user.permissions,
      });
    }
  };
};