"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { EllipsisVertical, SquarePen, Trash2, RefreshCw, Save } from "lucide-react"
import { StudentCard } from "@/components/student-card"
import { StudentImage } from "@/components/student-image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/my-dialog"

import { Input } from "@/components/ui/input"
import { callApi } from "@/lib/callApi"
import toast from "react-hot-toast"


// mapping ระดับชั้น -> ห้อง
const classesByGrade: Record<string, string[]> = {
  "1": ["1", "2", "3", "4"],
  "2": ["1", "2", "3", "4"],
  "3": ["1", "2", "3", "4"],
  "4": ["1", "2", "3", "4", "5", "6"],
  "5": ["1", "2", "3", "4", "5", "6"],
  "6": ["1", "2", "3", "4", "5", "6"],
}

// mock ปีการศึกษา
const academicYears = ["2567", "2568", "2569"]

// 🔹 type ของนักเรียน
interface StudentRow {
  id: string
  sNo: string
  sPrefix: string
  sFirstname: string
  sLastname: string
  sCitizenID: string
  sFullname: string
  sID: string
  sClass: string
  sRoom: string
}

export default function StudentsPage() {
  // ✅ state ของ filter
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [selectedClass, setselectedClass] = useState<string>("all")
  const [selectedRoom, setselectedRoom] = useState<string>("all")

  // ✅ modal state
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // ✅ data state
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // ✅ button state
  const [isEditStudent, setIsEditStudent] = useState(false)


  // ✅ useEffect 1: โหลดข้อมูลจาก localStorage
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


  const FetchStudents = useCallback(async () => {
    if (!selectedYear || !selectedTerm) return

    setIsLoading(true)
    try {
      const res = await callApi<StudentRow[]>(
        "/api/students",
        {
          action: "FetchStudents",
          xYear: selectedYear,
          xTerm: selectedTerm,
          sClass: selectedClass === "all" ? "all" : selectedClass.replace("ม.", ""),
          sRoom: selectedRoom,
        },
        "GET"
      )

      if (!res.success) {
        toast.error(res.message || "ไม่สามารถโหลดข้อมูลนักเรียนได้")
        return
      }

      const data = res.data
      if (!Array.isArray(data)) {
        toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง")
        return
      }

      const mapped = data.map(stu => ({
        id: String(stu.id ?? ""),
        sNo: String(stu.sNo ?? ""),
        sCitizenID: String(stu.sCitizenID ?? ""),
        sPrefix: String(stu.sPrefix ?? ""),
        sFirstname: String(stu.sFirstname ?? ""),
        sLastname: String(stu.sLastname ?? ""),
        sFullname: `${stu.sPrefix ?? ""}${stu.sFirstname ?? ""} ${stu.sLastname ?? ""}`,
        sID: String(stu.sID ?? ""),
        sClass: `มัธยมศึกษาปีที่ ${stu.sClass ?? ""}`,
        sRoom: `${stu.sClass ?? ""}0${stu.sRoom ?? ""}`,
      }))

      setStudents(mapped)
    } catch (err) {
      console.error("❌ FetchStudents error:", err)
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
    } finally {
      setIsLoading(false)
    }
  }, [selectedYear, selectedTerm, selectedClass, selectedRoom])


  // ✅ fetch students
  useEffect(() => {
    FetchStudents()
  }, [FetchStudents])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const handleEditStudent = async () => {
    if (isEditStudent) return
    setIsEditStudent(true)
    const res = await callApi("/api/students", {
      action: "EditStudent",
      data: editingStudent,
    })

    await sleep(400);

    if (!res.success) {
      toast.error(res.message)
      setIsEditStudent(false)
      setIsEditOpen(false)
      return
    }

    toast.success(res.message)
    FetchStudents();
    setIsEditStudent(false)
    setIsEditOpen(false)
  }

  // ✅ columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sFullname",
        header: "ชื่อ-สกุล",
        meta: { width: "300px", align: "left" as const },
        cell: ({ row }: { row: { original: StudentRow } }) => {
          const { sID, sPrefix, sFirstname, sLastname } = row.original
          return (
            <div className="flex items-center">
              <div className="w-[60px] h-[60px] rounded-full border-[3px] border-[#d9dcdf] dark:border-[#d9dcdf]/10 overflow-hidden mr-2">
                <StudentImage key={sID} sID={sID} fullname={`${sPrefix}${sFirstname} ${sLastname}`} />
              </div>
              <span>{sPrefix}{sFirstname} {sLastname}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "sCitizenID",
        header: "รหัสบัตรประชาชน",
        meta: { width: "180px", align: "center" as const },
        cell: ({ row }: { row: { original: StudentRow } }) => {
          const { sCitizenID } = row.original
          // ตัดทุกตัวที่ไม่ใช่ตัวเลขออกก่อน
          const digits = sCitizenID.replace(/\D/g, "");

          // ใส่ขีดตามรูปแบบ 0-0000-00000-00-0
          const formatted = digits.replace(
            /^(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})$/,
            "$1-$2-$3-$4-$5"
          );

          return formatted;
        }
      },
      { accessorKey: "sID", header: "รหัสนักเรียน", meta: { width: "150px", align: "center" as const } },
      { accessorKey: "sClass", header: "ระดับชั้น", meta: { width: "150px", align: "center" as const } },
      { accessorKey: "sRoom", header: "ห้อง", meta: { width: "100px", align: "center" as const } },
      { accessorKey: "sNo", header: "เลขที่", meta: { width: "100px", align: "center" as const } },
      {
        accessorKey: "actions",
        header: "ดำเนินการ",
        meta: { width: "150px", align: "center" as const },
        cell: ({ row }: { row: { original: StudentRow } }) => (
          <div className="flex justify-center items-center h-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" className="bg-background dark:bg-input/30 dark:hover:bg-input/50">
                  <span className="sr-only">Open menu</span>
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-lg" side="right" align="start">
                <DropdownMenuItem
                  onSelect={() => {
                    const student = row.original
                    requestAnimationFrame(() => {
                      setEditingStudent(student)
                      setIsEditOpen(true)
                    })
                  }}
                >
                  <SquarePen className="text-muted-foreground mr-2" />
                  <span>แก้ไข</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    console.log("TODO: ลบ", row.original.sID)
                  }}
                >
                  <Trash2 className="text-muted-foreground mr-2" />
                  <span>ลบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [setEditingStudent, setIsEditOpen]
  )

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
              setselectedClass(val)
              setselectedRoom("all")
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
          <Select value={selectedRoom} onValueChange={setselectedRoom}>
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
      <DataTable data={students} columns={columns} isLoading={isLoading} rowHeight="h-18" />

      {/* Modal แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen} >
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลนักเรียน</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {editingStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ซ้าย: StudentCard */}
              <div className="flex justify-center items-start">
                <StudentCard
                  student={{
                    sID: editingStudent.sID,
                    fullname: editingStudent.sFirstname + " " + editingStudent.sLastname,
                    sPIN: editingStudent.sCitizenID,
                    dob: "2007-05-12",
                  }}
                />
              </div>
              {/* ขวา: ฟอร์ม input */}
              <div className="space-y-4">
                {editingStudent && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Input
                        type="hidden"
                          value={editingStudent.id}
                          onChange={(e) =>
                            setEditingStudent((prev) =>
                              prev ? { ...prev, id: e.target.value } : prev
                            )
                          }
                          readOnly
                        />
                        <label className="block text-sm font-medium mb-1">คำนำหน้า</label>
                        <Select
                          value={editingStudent.sPrefix}
                          onValueChange={(val) =>
                            setEditingStudent((prev) =>
                              prev ? { ...prev, sPrefix: val } : prev
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกคำนำหน้า" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="เด็กชาย">เด็กชาย</SelectItem>
                            <SelectItem value="เด็กหญิง">เด็กหญิง</SelectItem>
                            <SelectItem value="นาย">นาย</SelectItem>
                            <SelectItem value="นางสาว">นางสาว</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium">ชื่อ</label>
                        <Input
                          value={editingStudent.sFirstname}
                          onChange={(e) =>
                            setEditingStudent((prev) =>
                              prev ? { ...prev, sFirstname: e.target.value } : prev
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">นามสกุล</label>
                        <Input
                          value={editingStudent.sLastname}
                          onChange={(e) =>
                            setEditingStudent((prev) =>
                              prev ? { ...prev, sLastname: e.target.value } : prev
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">รหัสบัตรประชาชน</label>
                        <Input
                          value={editingStudent.sCitizenID}
                          onChange={(e) =>
                            setEditingStudent((prev) =>
                              prev ? { ...prev, sCitizenID: e.target.value } : prev
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">รหัสนักเรียน</label>
                        <Input
                          value={editingStudent.sID}
                          onChange={(e) =>
                            setEditingStudent((prev) =>
                              prev ? { ...prev, sID: e.target.value } : prev
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              disabled={isEditStudent}
              onClick={handleEditStudent}
            >
              {isEditStudent ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  บันทึก
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
