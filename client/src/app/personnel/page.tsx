"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import { EllipsisVertical, SquarePen, Trash2 } from "lucide-react"
import { StudentCard } from "@/components/student-card"
import { TeacherImage } from "@/components/teacher-image"
import { Button } from "@/components/ui/button"
import { callApi } from "@/lib/callApi"
import toast from "react-hot-toast"

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

// 🔹 type ของนักเรียน
interface TeacherRow {
  tID : string
  tPrefix : string
  tFirstname : string
  tLastname : string
  fullname: string
  tCitizenID : string
  tPhoto : string
  tEmail : string
  tWorking : string
}

export default function StudentsPage() {

  // ✅ modal state
  const [editingTeacher, setEditingTeacher] = useState<TeacherRow | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // ✅ data state
  const [students, setStudents] = useState<TeacherRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const FetchTeachers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await callApi<TeacherRow[]>(
        "/api/teachers",
        {
          action: "FetchTeachers",
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

      const mapped = data.map(t => ({
        tID: String(t.tID ?? ""),
        tCitizenID: String(t.tCitizenID ?? ""),
        tPrefix: String(t.tPrefix ?? ""),
        tFirstname: String(t.tFirstname ?? ""),
        tLastname: String(t.tLastname ?? ""),
        fullname: `${t.tPrefix ?? ""}${t.tFirstname ?? ""} ${t.tLastname ?? ""}`,
        tPhoto: String(t.tPhoto ?? ""),
        tEmail: String(t.tEmail ?? ""),
        tWorking: String(t.tWorking ?? ""),
      }))

      setStudents(mapped)
    } catch (err) {
      console.error("❌ FetchStudents error:", err)
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
    } finally {
      setIsLoading(false)
    }
  }, [])


  // ✅ fetch students
  useEffect(() => {
    FetchTeachers()
  }, [FetchTeachers])

  // ✅ columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "fullname",
        header: "ชื่อ-สกุล",
        meta: { width: "300px", align: "left" as const },
        cell: ({ row }: { row: { original: TeacherRow } }) => {
          const { tPhoto, fullname } = row.original
          return (
            <div className="flex items-center">
              <div className="w-[60px] h-[60px] rounded-full border-[3px] border-[#d9dcdf] dark:border-[#d9dcdf]/10 overflow-hidden mr-2">
                <TeacherImage tPhoto={tPhoto} fullname={fullname} />
              </div>
              <span>{fullname}</span>
            </div>
          )
        },
      },
      { accessorKey: "tCitizenID", header: "รหัสบัตรประชาชน", meta: { width: "150px", align: "center" as const } },
      { accessorKey: "tEmail", header: "อีเมล", meta: { width: "120px", align: "center" as const } },
      {
        accessorKey: "actions",
        header: "ดำเนินการ",
        meta: { width: "120px", align: "center" as const },
        cell: ({ row }: { row: { original: TeacherRow } }) => (
          <div className="flex justify-center items-center h-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" className="size-9 p-0">
                  <span className="sr-only">Open menu</span>
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-lg" side="right" align="start">
                <DropdownMenuItem
                  onSelect={() => {
                    const student = row.original
                    requestAnimationFrame(() => {
                      setEditingTeacher(student)
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
                    console.log("TODO: ลบ", row.original.tID)
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
    []
  )

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap pb-10">
        {/* ปีการศึกษา */}
        <Button>เพิ่มครูและบุคลากร</Button>
      </div>

      {/* ตาราง */}
      <DataTable data={students} columns={columns} isLoading={isLoading} rowHeight="h-18" />

      {/* Modal แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลนักเรียน</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {editingTeacher && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ซ้าย: StudentCard */}
              <div className="flex justify-center items-start">
                <StudentCard
                  student={{
                    sID: editingTeacher.tID,
                    fullname: editingTeacher.fullname,
                    sPIN: editingTeacher.tID,
                    dob: "2007-05-12",
                  }}
                />
              </div>

              {/* ขวา: ฟอร์ม input */}
              <div className="space-y-4">
                {["fullname", "sPIN", "sID", "xYear", "sClass", "sRoom"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm">{field}</label>
                    <Input defaultValue={String(editingTeacher[field as keyof TeacherRow])} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={() => {
                console.log("TODO: save", editingTeacher)
                setIsEditOpen(false)
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
