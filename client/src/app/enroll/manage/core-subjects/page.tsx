"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { BookText, Edit, RefreshCw, FolderOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { callApi } from "@/lib/callApi"
import { IOSSwitch } from "@/components/ios-switch"

interface SubjectsRow {
  id: string
  subID: string
  subName: string
  subIDEng: string
  subNameEng: string
  subType: string
  subTypeName: string
  subCategory: string
  subCategoryName: string
  subCr: string
  xOpenSubject: boolean
}





export default function SubjectsPage() {
  // ✅ state ของ filter
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("1")
  const [selectedGroup, setSelectedGroup] = useState<string>("4")


  // ✅ data state
  const [Subjects, setSubjects] = useState<SubjectsRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // ✅ button state
  const [isAssignConfig, setIsAssignConfig] = useState(false)
  const [isCancelConfig, setIsCancelConfig] = useState(false)


  // ✅ useEffect 1: โหลดข้อมูลจาก localStorage
  useEffect(() => {
    const cached = localStorage.getItem("user")

    if (cached) {
      try {
        const user = JSON.parse(cached)
        if (user?.year) setSelectedYear(String(user.year))
        if (user?.term) setSelectedTerm(String(user.term))
      } catch (err) {
        console.error("❌ localStorage.user JSON parse error:", err)
      }
    }
  }, [])



  // ✅ fetch function
  const fetchConfig = useCallback(async () => {
    if (!selectedYear || !selectedTerm || !selectedClass) return

    setIsLoading(true)
    try {
      const res = await callApi<SubjectsRow[]>(
        "/api/enroll",
        {
          action: "FetchManageSubjects",
          year: selectedYear,
          term: selectedTerm,
          classroom: selectedClass,
          type: "core",
        },
        "GET"
      )

      if (!res.success) {
        toast.error(res.message || "ไม่สามารถโหลดข้อมูลได้")
        return
      }

      const data = res.data

      if (!Array.isArray(data)) {
        setSubjects([])
        toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง")
        return
      }

      const mapped = data.map(sub => ({
        id: String(sub.id ?? ""),
        subID: String(sub.subID ?? ""),
        subName: String(sub.subName ?? ""),
        subIDEng: String(sub.subIDEng ?? ""),
        subNameEng: String(sub.subNameEng ?? ""),
        subType: String(sub.subType ?? ""),
        subTypeName: String(sub.subTypeName ?? ""),
        subCategory: String(sub.subCategory ?? ""),
        subCategoryName: String(sub.subCategoryName ?? ""),
        subCr: String(sub.subCr ?? ""),
        xOpenSubject: Boolean(sub.xOpenSubject ?? false)
      }))

      setSubjects(mapped)
    } catch (err) {
      console.error("❌ FetchStudents error:", err)
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
    } finally {
      setIsLoading(false)
    }
  }, [selectedYear, selectedTerm, selectedClass])

  // ✅ fetch Subjects
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig, selectedYear, selectedTerm, selectedClass])





  const handleToggleOpenSubject = useCallback(
    async (rowData: SubjectsRow, newValue: boolean) => {
      // update UI ทันที (optimistic update)
      setSubjects((prev) =>
        prev.map((r) =>
          r.subID === rowData.subID
            ? { ...r, xOpenSubject: newValue }
            : r
        )
      )

      const res = await callApi("/api/enroll", {
        action: "ToggleOpenSubject",
        year: selectedYear,
        term: selectedTerm,
        classroom: selectedClass,
        group: selectedGroup,
        id: rowData.id,
        subID: rowData.subID,
        xOpenSubject: newValue ? "1" : "0",
      })


      if (!res.success) {
        toast.error(res.message)
        // rollback UI
        setSubjects((prev) =>
          prev.map((r) =>
            r.subID === rowData.subID
              ? { ...r, xOpenSubject: !newValue }
              : r
          )
        )

        return
      }
      toast.success(res.message)
    },
    [selectedYear, selectedTerm, selectedClass, selectedGroup]
  )



  // ✅ columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "subName",
        header: "ชื่อวิชา",
        meta: { width: "400px", align: "left" as const },
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
      { accessorKey: "subCr", header: "หน่วยกิต/ชม.", meta: { width: "120px", align: "center" as const } },
      {
        accessorKey: "subTypeName",
        header: "ประเภทวิชา",
        meta: { width: "140px", align: "center" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { subType, subTypeName } = row.original
          return (
            <span className={`textcolor-${subType} px-3 py-0.5 rounded-xl font-bold`}>{subTypeName}</span>
          )
        },
      },
      {
        accessorKey: "xOpenSubject",
        header: "เปิด-ปิด วิชา",
        meta: { width: "120px", align: "center" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { original } = row
          return (
            <IOSSwitch
              checked={original.xOpenSubject}
              onCheckedChange={(checked) => handleToggleOpenSubject(original, checked)}
            />
          )
        },
      },

    ],
    [handleToggleOpenSubject]
  )

  return (
    <>
      {/* Filters */}
      <div className="flex justify-between flex-col sm:flex-row gap-4 flex-wrap pb-10 text-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          {/* ปีการศึกษา */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold">ปีการศึกษา :</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="เลือกปีการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2567">2567</SelectItem>
                <SelectItem value="2568">2568</SelectItem>
                <SelectItem value="2569">2569</SelectItem>
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
          <div className="flex items-center gap-2 flex-col sm:flex-row">
            <span className="whitespace-nowrap font-bold mt-1">ระดับชั้น :</span>

            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5", "6"].map((cls) => (
                <Button
                  key={cls}
                  className="min-w-[70px]"         // ให้ปุ่มมีขนาดขั้นต่ำ จะไม่ยุบจนอ่านยาก
                  variant={selectedClass === cls ? "default" : "outline"}
                  onClick={() => {
                    setSelectedClass(cls)
                    if (Number(cls) <= 3) {
                      setSelectedGroup("4")
                    } else {
                      setSelectedGroup("6")
                    }
                  }}
                >
                  ม.{cls}
                </Button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold">จำนวนกลุ่ม :</span>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="เลือกจำนวนกลุ่ม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="flex-1 sm:flex-none"
            onClick={fetchConfig}
          >
            {isAssignConfig ? (
              <>
                <RefreshCw className="animate-spin" /> กำลังเปิดวิชา...
              </>
            ) : (
              <>
                <FolderOpen /> เปิดสอนทั้งหมด
              </>
            )}

          </Button>
        </div>
      </div>

      {/* ตาราง */}
      <div className="col-span-4"><DataTable data={Subjects} columns={columns} isLoading={isLoading} defaultPageSize="full" downloadButton={false} rowHeight="h-18" /></div>
    </>
  )
}
