"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { BookText, Armchair } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { callApi } from "@/lib/callApi"
import { IOSSwitch } from "@/components/ios-switch"

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
  xGroup: string
  xLimit: string
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
          action: "FetchManageSections",
          year: selectedYear,
          term: selectedTerm,
          classroom: selectedClass
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
        subID: String(sub.subID ?? ""),
        subName: String(sub.subName ?? ""),
        subIDEng: String(sub.subIDEng ?? ""),
        subNameEng: String(sub.subNameEng ?? ""),
        subType: String(sub.subType ?? ""),
        subTypeName: String(sub.subTypeName ?? ""),
        subCategory: String(sub.subCategory ?? ""),
        subCategoryName: String(sub.subCategoryName ?? ""),
        subCr: String(sub.subCr ?? ""),
        xGroup: String(sub.xGroup ?? ""),
        xLimit: String(sub.xLimit ?? "")
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



  // ✅ columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "subName",
        header: "ชื่อวิชา",
        meta: { width: "400px", align: "left" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { subID, subName, subIDEng, subNameEng, subCategory, subCategoryName } = row.original
          return (
            <div className="flex items-center">
              <div className="bg-background shadow-xs hover:bg-accent hover:text-accent-foreground p-1.5 rounded-lg">
                <BookText className="size-7 text-primary" strokeWidth={1.5} />
              </div>
              <div className="px-3">
                <div className="flex items-center gap-1">{subID} {subName} <span className={`text-[11px] textcolor-${subCategory} px-2 py-0.5 rounded-xl font-bold`}>{subCategoryName}</span></div>
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
        accessorKey: "xGroup",
        header: "กลุ่ม/ห้อง",
        meta: { width: "120px", align: "center" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { subID, xGroup } = row.original
          return (
            <div>{subID} - {xGroup}</div>
          )
        },
      },
      {
        accessorKey: "xLimit",
        header: "จำนวนที่นั่ง",
        meta: { width: "120px", align: "center" as const },
        cell: ({ row }: { row: { original: SubjectsRow } }) => {
          const { xLimit } = row.original
          return (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground py-1.5 px-3 rounded-lg">
                <b className="text-accent-foreground">{xLimit}</b> <Armchair className="size-5 text-primary" strokeWidth={2.5} />
              </div>
            </div>
          )
        },
      },
    ],
    []
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
                  onClick={() => setSelectedClass(cls)}
                >
                  ม.{cls}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <div className="col-span-4"><DataTable data={Subjects} columns={columns} isLoading={isLoading} defaultPageSize="full" downloadButton={false} rowHeight="h-18" /></div>
    </>
  )
}
