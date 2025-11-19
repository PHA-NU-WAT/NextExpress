"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import Image from "next/image"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { BookText, Edit, RefreshCw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface SubjectsRow {
  subID: string
  subName: string
  subIDEng: string
  subNameEng: string
  subType: string
  subTypeName: string
  subCategory: string
  subCategoryName: string
  subCr: string
  subFile: string
}

const curriculums = [["1", "หลักสูตรโรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย ชั้นมัธยมศึกษาตอนต้น พ.ศ. 2566"], ["2", "หลักสูตรโรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย ชั้นมัธยมศึกษาตอนปลาย พ.ศ. 2566"]]

export default function SubjectsPage() {
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("1")

  // ✅ data state
  const [Subjects, setSubjects] = useState<SubjectsRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // ✅ modal state
  const [editingAssign, setEditingAssign] = useState<SubjectsRow | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  // ✅ button state
  const [isEditConfig, setIsEditConfig] = useState(false)
  // ✅ fetch Subjects function
  const FetchSubjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await callApi<SubjectsRow[]>(
        "/api/curriculums",
        {
          action: "FetchSubjects",
          curid: selectedCurriculum
        },
        "GET"
      )

      if (!res.success) {
        toast.error(res.message || "ไม่สามารถโหลดข้อมูลรายวิชาได้")
        return
      }

      const data = res.data
      if (!Array.isArray(data)) {
        toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง")
        return
      }

      const mapped = data.map(sub => ({
        subID: String(sub.subID ?? ""),
        subName: String(sub.subName ?? ""),
        subIDEng: String(sub.subIDEng ?? ""),
        subNameEng: String(sub.subNameEng ?? ""),
        subType: String(sub.subType ?? ""),
        subTypeName: String(sub.subTypeName ?? ""),
        subCategory: String(sub.subCategory ?? ""),
        subCategoryName: String(sub.subCategoryName ?? ""),
        subCr: String(sub.subCr ?? ""),
        subFile: String(sub.subFile ?? ""),
      }))

      setSubjects(mapped)
    } catch (err) {
      console.error("❌ FetchStudents error:", err)
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
    } finally {
      setIsLoading(false)
    }
  }, [selectedCurriculum])

  // ✅ fetch Subjects
  useEffect(() => {
    FetchSubjects()
  }, [FetchSubjects, selectedCurriculum])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleEditSubjects = async () => {
    if (isEditConfig) return
    setIsEditConfig(true)
    const res = await callApi("/api/curriculums", {
      action: "EditCurriculums",
      data: editingAssign,
    })

    await sleep(400);

    if (!res.success) {
      toast.error(res.message)
      setIsEditConfig(false)
      setIsEditOpen(false)
      return
    }

    toast.success(res.message)
    FetchSubjects();
    setIsEditConfig(false)
    setIsEditOpen(false)
  }

  // ✅ columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "subName",
        header: "ชื่อวิชา",
        meta: { width: "550px", align: "left" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { subID, subName, subIDEng, subNameEng } = row.original
          return (
            <div className="flex items-center">
              <div className="bg-background shadow-xs hover:bg-accent hover:text-accent-foreground p-1.5 rounded-lg">
                <BookText className="size-7 text-primary" strokeWidth={1.5} />
              </div>
              <div className="px-3">
                <div>{subID} {subName}</div>
                <div className="text-[13px] text-muted-foreground">{subIDEng} {subNameEng}</div>
              </div>
            </div>
          )
        },
      },
      { accessorKey: "subCr", header: "หน่วยกิต/ชม.", meta: { width: "140px", align: "center" as const } },
      {
        accessorKey: "subTypeName",
        header: "ประเภทวิชา",
        meta: { width: "140px", align: "center" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { subTypeName } = row.original
          let Bgcolor = ""
          let color = ""
          if (subTypeName === "พื้นฐาน") {
            Bgcolor = "bg-[rgb(216,243,220)]"
            color = "text-[#256c3a]"
          } else if (subTypeName === "เพิ่มเติมกลุ่ม 1" || subTypeName === "เพิ่มเติมกลุ่ม 1 (ภาษา)") {
            Bgcolor = "bg-[rgb(232,222,250)]"
            color = "text-[#5b3fa3]"
          } else if (subTypeName === "เพิ่มเติมกลุ่ม 2") {
            Bgcolor = "bg-[rgb(214,234,248)]"
            color = "text-[#0f4c81]"
          } else if (subTypeName === "กิจกรรม") {
            Bgcolor = "bg-[rgb(252,231,243)]"
            color = "text-[#ad4379]"
          }

          return (
            <span className={`${Bgcolor} ${color} px-3 py-0.5 rounded-xl font-bold`}>{subTypeName}</span>
          )
        },
      },
      { accessorKey: "subCategoryName", header: "หมวดหมู่", meta: { width: "350px", align: "center" as const } },
      {
        accessorKey: "subFile",
        header: "คำอธิบายรายวิชา",
        meta: { width: "140px", align: "center" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { subID } = row.original
          return (
            <span className="flex justify-center" key={subID}>
              <Image
                src="/icons/pdf.svg"
                alt="PDF icon"
                width={30}
                height={30}
                className="cursor-pointer transition-all"
                style={{ filter: "drop-shadow(0px 0px 3px rgb(0 0 0 / 0.1))" }}
              />
            </span>
          )
        },
      },
      {
        accessorKey: "actions",
        header: "ดำเนินการ",
        meta: { width: "150px", align: "center" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          return (
            <Button
              data-sidebar="trigger"
              data-slot="sidebar-trigger"
              variant="ghost"
              size="icon"
              className="bg-background dark:bg-input/30 dark:hover:bg-input/50"
              onClick={() => {
                const rowData = row.original
                console.log(rowData)
                requestAnimationFrame(() => {
                  setEditingAssign(rowData)
                  setIsEditOpen(true)
                })
              }}
            >
              <Edit />
            </Button>
          )
        },
      },
    ],
    []
  )

  return (
    <>
      {/* Filters */}
      <div className="text-sm pb-10 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 w-full max-w-[900px]">
        <label className="whitespace-nowrap font-bold">หลักสูตร :</label>
        <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกหลักสูตร" />
          </SelectTrigger>
          <SelectContent className="max-w-[90vw]">
            {curriculums.map(([id, name]) => (
              <SelectItem
                key={id}
                value={id}
                className="whitespace-normal break-words leading-snug"
              >
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="w-full justify-self-start sm:justify-self-auto">
          เพิ่มรายวิชา
        </Button>
      </div>




      {/* ตาราง */}
      <DataTable data={Subjects} columns={columns} isLoading={isLoading} downloadButton={false} rowHeight="h-18" />

      {/* Modal แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลรายวิชา</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {editingAssign && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium">ชื่อวิชา</label>
                  <Input
                    value={editingAssign.subName}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curName: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">ชื่อวิชาภาษาอังกฤษ</label>
                  <Input
                    value={editingAssign.subNameEng}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curName: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isEditConfig}
              onClick={() => setIsEditOpen(false)}
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              disabled={isEditConfig}
              onClick={handleEditSubjects}
            >
              {isEditConfig ? (
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
