"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { BookText, UserRoundPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { callApi } from "@/lib/callApi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/my-dialog"

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
  tName: string
}





export default function SubjectsPage() {
  // ✅ state ของ filter
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("1")
  const [selectedGroup, setSelectedGroup] = useState<string>("4")

  // ✅ modal state
  const [editingAssign, setEditingAssign] = useState<SubjectsRow | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // ✅ data state
  const [Subjects, setSubjects] = useState<SubjectsRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // ✅ button state
  const [isAssignConfig, setIsAssignConfig] = useState(false)
  const [isCancelConfig, setIsCancelConfig] = useState(false)
  const [isEditConfig, setIsEditConfig] = useState(false)


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
          action: "FetchManageSectionsTeachers",
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
        xLimit: String(sub.xLimit ?? ""),
        tName: String(sub.tName ?? "")
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
      { accessorKey: "tName", header: "ครูผู้สอน", meta: { width: "450px", align: "left" as const } },
      {
        accessorKey: "actions",
        header: "เพิ่มครูผู้สอน",
        meta: { width: "100px", align: "center" as const },
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
              <UserRoundPlus />
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

      {/* Modal แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent size="xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>เพิ่มครูผู้สอน</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {editingAssign && (
            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium">รหัสวิชา</label>
                  <Input
                    value={editingAssign.subID}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium">ชื่อวิชา</label>
                  <Input
                    value={editingAssign.subName}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">กลุ่ม/ห้อง</label>
                  <Input
                    value={editingAssign.xGroup}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">ระดับชั้น</label>
                  <Input
                    value={selectedClass}
                    readOnly
                    className="bg-muted cursor-not-allowed"
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

            {/* <Button
              type="button"
              disabled={isEditConfig}
              onClick={handleEditConfig}
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
            </Button> */}
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </>
  )
}
