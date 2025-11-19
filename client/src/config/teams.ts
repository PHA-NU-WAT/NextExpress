// src/config/teams.ts
import { School, Ruler, BookCheck, GraduationCap, BookOpenText, Receipt } from "lucide-react"

export interface TeamItem {
  name: string
  logo: React.ElementType
  plan: string
  url: string
  roles: string[]
}

export const TEAMS: TeamItem[] = [
  {
    name: "ทะเบียนครูและบุคลากร",
    logo: GraduationCap,
    plan: "PCSHS Teacher Registry",
    url: "/personnel",
    roles: ["guest", "teacher", "admin", "student"],
  },
  {
    name: "ทะเบียนนักเรียน",
    logo: GraduationCap,
    plan: "PCSHS Student Registry",
    url: "/register",
    roles: ["guest", "teacher", "admin", "student"],
  },
  {
    name: "หลักสูตรสถานศึกษา",
    logo: BookOpenText,
    plan: "PCSHS Curriculums",
    url: "/curriculums",
    roles: ["teacher", "admin"],
  },
  {
    name: "ลงทะเบียนเรียน",
    logo: BookCheck,
    plan: "PCSHS Enrollment",
    url: "/enroll",
    roles: ["teacher", "admin"],
  },
  {
    name: "วัดผลการเรียน",
    logo: Ruler,
    plan: "PCSHS Evaluation",
    url: "/evaluation",
    roles: ["guest", "teacher", "admin", "student"],
  },
  {
    name: "สลิปเงินเดือน",
    logo: Receipt,
    plan: "PCSHS Salary Slip",
    url: "/salary",
    roles: ["guest", "teacher", "admin", "student"],
  },
  {
    name: "หน้าแรก",
    logo: School,
    plan: "PCSHS Homepage",
    url: "/",
    roles: ["teacher"],
  },
]
