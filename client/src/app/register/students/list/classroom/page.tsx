"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { StudentImage } from "@/components/student-image"
import { callApi } from "@/lib/callApi"

// 🔹 mapping ระดับชั้น -> ห้อง
const classesByGrade: Record<string, string[]> = {
  "1": ["1", "2", "3", "4"],
  "2": ["1", "2", "3", "4"],
  "3": ["1", "2", "3", "4"],
  "4": ["1", "2", "3", "4", "5", "6"],
  "5": ["1", "2", "3", "4", "5", "6"],
  "6": ["1", "2", "3", "4", "5", "6"],
}

// 🔹 mock ปีการศึกษา
const academicYears = ["2567", "2568", "2569"]

// 🔹 type ของนักเรียน
interface StudentRow {
  sNo: string
  sPrefix: string
  sFirstname: string
  sLastname: string
  fullname: string
  sID: string
  sClass: string
  sRoom: string
}

export default function StudentsPublicPage() {
  // ✅ state ของ filter
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedRoom, setSelectedRoom] = useState<string>("all")

  // ✅ data state
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // ✅ โหลดค่าปี/เทอมจาก localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem("user")
      if (!cached) return
      const user = JSON.parse(cached)
      console.log("✅ Loaded user from localStorage:", user)
      if (user?.year) setSelectedYear(String(user.year))
      if (user?.term) setSelectedTerm(String(user.term))
    } catch (err) {
      console.error("❌ localStorage.user JSON parse error:", err)
    }
  }, [])

  // ✅ ฟังก์ชัน fetch ข้อมูลนักเรียน (ใช้ callApi)
  const fetchStudentsPublic = useCallback(async () => {
    if (!selectedYear || !selectedTerm) return
    setIsLoading(true)
    try {
      const res = await callApi<StudentRow[]>(
        "/api/public",
        {
          action: "FetchStudentsPublic",
          xYear: selectedYear,
          xTerm: selectedTerm,
          sClass: selectedClass === "all" ? "all" : selectedClass.replace("ม.", ""),
          sRoom: selectedRoom,
          schoolID: "10",
        },
        "GET"
      )

      if (!res.success) {
        console.warn("⚠️ FetchStudentsPublic failed:", res.message)
        return
      }

      const data = res.data
      if (Array.isArray(data)) {
        const mapped: StudentRow[] = data.map((stu) => ({
          sNo: String(stu.sNo ?? ""),
          sPrefix: String(stu.sPrefix ?? ""),
          sFirstname: String(stu.sFirstname ?? ""),
          sLastname: String(stu.sLastname ?? ""),
          fullname: `${stu.sPrefix ?? ""}${stu.sFirstname ?? ""} ${stu.sLastname ?? ""}`,
          sID: String(stu.sID ?? ""),
          sClass: `มัธยมศึกษาปีที่ ${stu.sClass ?? ""}`,
          sRoom: `${stu.sClass ?? ""}0${stu.sRoom ?? ""}`,
        }))
        setStudents(mapped)
      } else {
        console.warn("⚠️ Invalid response structure:", data)
      }
    } catch (err) {
      console.error("❌ FetchStudentsPublic error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedYear, selectedTerm, selectedClass, selectedRoom])

  // ✅ เรียก fetch เมื่อ filter เปลี่ยน
  useEffect(() => {
    fetchStudentsPublic()
  }, [fetchStudentsPublic])

  // ✅ columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "fullname",
        header: "ชื่อ-สกุล",
        meta: { width: "300px", align: "left" as const },
        cell: ({ row }: { row: { original: StudentRow } }) => {
          const { sID, fullname } = row.original
          return (
            <div className="flex items-center">
              <div className="w-[60px] h-[60px] rounded-full border-[3px] border-[#d9dcdf] dark:border-[#d9dcdf]/10 overflow-hidden mr-2">
                <StudentImage key={sID} sID={sID} fullname={fullname} />
              </div>
              <span>{fullname}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "sID",
        header: "รหัสนักเรียน",
        meta: { width: "150px", align: "center" as const },
      },
      {
        accessorKey: "sClass",
        header: "ระดับชั้น",
        meta: { width: "150px", align: "center" as const },
      },
      {
        accessorKey: "sRoom",
        header: "ห้อง",
        meta: { width: "100px", align: "center" as const },
      },
      {
        accessorKey: "sNo",
        header: "เลขที่",
        meta: { width: "100px", align: "center" as const },
      },
    ],
    []
  )

  // ✅ render
  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap pb-10 text-sm">
        {/* ปีการศึกษา */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-bold">ปีการศึกษา :</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="เลือกปีการศึกษา" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ภาคเรียน */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-bold">ภาคเรียน :</span>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="เลือกภาคเรียน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ระดับชั้น */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-bold">ระดับชั้น :</span>
          <Select
            value={selectedClass}
            onValueChange={(val) => {
              setSelectedClass(val)
              setSelectedRoom("all")
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="เลือกระดับชั้น" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับชั้น</SelectItem>
              {Object.keys(classesByGrade).map((grade) => (
                <SelectItem key={grade} value={grade}>
                  ม.{grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ห้อง */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-bold">ห้อง :</span>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="เลือกห้อง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกห้อง</SelectItem>
              {selectedClass !== "all" &&
                classesByGrade[selectedClass]?.map((room) => (
                  <SelectItem key={room} value={room}>
                    {`${selectedClass}0${room}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ตาราง */}
      <DataTable
        data={students}
        columns={columns}
        isLoading={isLoading}
        rowHeight="h-18"
      />
    </>
  )
}
