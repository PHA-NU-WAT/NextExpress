"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Edit, RefreshCw, ListPlus, Trash2, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/my-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { callApi } from "@/lib/callApi"
interface configRow {
  xYear: string
  xTerm: string
  xClass: string
  curID: string
  curName: string
}




export default function SubjectsPage() {
  // ✅ state ของ filter
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")

  // ✅ modal state
  const [editingAssign, setEditingAssign] = useState<configRow | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // ✅ data state
  const [Subjects, setSubjects] = useState<configRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // ✅ button state
  const [isAssignConfig, setIsAssignConfig] = useState(false)
  const [isCancelConfig, setIsCancelConfig] = useState(false)
  const [isEditConfig, setIsEditConfig] = useState(false)



  const curriculumList = [
    { id: "1", name: "หลักสูตรโรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย ชั้นมัธยมศึกษาตอนต้น พ.ศ. 2566" },
    { id: "2", name: "หลักสูตรโรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย ชั้นมัธยมศึกษาตอนปลาย พ.ศ. 2566" },
  ]

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
    if (!selectedYear || !selectedTerm) return

    setIsLoading(true)
    try {
      const res = await callApi<configRow[]>(
        "/api/enroll",
        {
          action: "FetchConfig",
          year: selectedYear,
          term: selectedTerm
        },
        "GET"
      )

      if (!res.success) {
        toast.error(res.message || "ไม่สามารถโหลดข้อมูลได้")
        return
      }

      const data = res.data
      if (!Array.isArray(data)) {
        toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง")
        return
      }

      const mapped = data.map(x => ({
        xYear: String(x.xYear ?? ""),
        xTerm: String(x.xTerm ?? ""),
        xClass: String(`ม.${x.xClass ?? ""}`),
        curID: String(x.curID ?? ""),
        curName: String(x.curName ?? "")
      }))

      setSubjects(mapped)
    } catch (err) {
      console.error("❌ FetchStudents error:", err)
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
    } finally {
      setIsLoading(false)
    }
  }, [selectedYear, selectedTerm])
  
  // ✅ fetch Subjects
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig, selectedYear, selectedTerm])




  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const handleAssignConfig = async () => {
    if (isAssignConfig) return
    setIsAssignConfig(true)
    const res = await callApi("/api/enroll", {
      action: "AssignConfig",
      year: selectedYear,
      term: selectedTerm
    })

    await sleep(400);

    if (!res.success) {
      toast.error(res.message)
      setIsAssignConfig(false)
      return
    }

    toast.success(res.message)
    fetchConfig();
    setIsAssignConfig(false)
  }
  const handleCancelConfig = async () => {
    if (isCancelConfig) return
    setIsCancelConfig(true)
    const res = await callApi("/api/enroll", {
      action: "CancelConfig",
      year: selectedYear,
      term: selectedTerm
    })

    await sleep(400);

    if (!res.success) {
      toast.error(res.message)
      setIsCancelConfig(false)
      return
    }

    toast.success(res.message)
    fetchConfig();
    setIsCancelConfig(false)
  }

  const handleEditConfig = async () => {
    if (isEditConfig) return
    setIsEditConfig(true)
    const res = await callApi("/api/enroll", {
      action: "EditConfig",
      year: editingAssign?.xYear,
      term: editingAssign?.xTerm,
      classroom: editingAssign?.xClass,
      curID: editingAssign?.curID,
    })

    await sleep(400);

    if (!res.success) {
      toast.error(res.message)
      setIsEditConfig(false)
      setIsEditOpen(false)
      return
    }

    toast.success(res.message)
    fetchConfig();
    setIsEditConfig(false)
    setIsEditOpen(false)
  }

  // ✅ columns
  const columns = useMemo(
    () => [
      { accessorKey: "xYear", header: "ปีการศึกษา", meta: { width: "100px", align: "center" as const } },
      { accessorKey: "xTerm", header: "ภาคเรียน", meta: { width: "100px", align: "center" as const } },
      { accessorKey: "xClass", header: "ระดับชั้น", meta: { width: "80px", align: "center" as const } },
      { accessorKey: "curName", header: "หลักสูตรที่ใช้", meta: { width: "520px", align: "left" as const } },
      {
        accessorKey: "actions",
        header: "ดำเนินการ",
        meta: { width: "100px", align: "center" as const },
        cell: ({ row }: { row: { original: configRow } }) => {
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
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 sm:flex-none"
            onClick={handleAssignConfig}
          >
            {isAssignConfig ? (
              <>
                <RefreshCw className="animate-spin" /> กำลังนำเข้าข้อมูล...
              </>
            ) : (
              <>
                <ListPlus /> {selectedTerm === "2" ? "นำเข้าจากภาคเรียนที่ 1" : "นำเข้าจากปีก่อนหน้า"}
              </>
            )}

          </Button>
          <Button variant="outline" onClick={handleCancelConfig}>
            {isCancelConfig ? (
              <>
                <RefreshCw className="animate-spin" /> กำลังยกเลิก...
              </>
            ) : (
              <>
                <Trash2 /> ยกเลิก
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ตาราง */}
      <DataTable data={Subjects} columns={columns} isLoading={isLoading} rowHeight="h-15" />

      {/* Modal แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent size="xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลหลักสูตรที่ใช้</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {editingAssign && (
            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium">ปีการศึกษา</label>
                  <Input
                    value={editingAssign.xYear}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">ภาคเรียน</label>
                  <Input
                    value={editingAssign.xTerm}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">ระดับชั้น</label>
                  <Input
                    value={editingAssign.xClass}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1">
                <label className="block text-sm font-medium">หลักสูตรที่ใช้</label>
                <Select
                  defaultValue={String(editingAssign.curID)}
                  onValueChange={(val) => {
                    const found = curriculumList.find((c) => c.id === val)
                    setEditingAssign((prev) =>
                      prev ? { ...prev, curID: val, curName: found?.name ?? "" } : prev
                    )
                  }}

                >
                  <SelectTrigger className="w-full xl:w-3/5">
                    <SelectValue placeholder="เลือกหลักสูตร" />
                  </SelectTrigger>

                  <SelectContent className="max-w-[85vw]">
                    {curriculumList.map((cur) => (
                      <SelectItem
                        key={cur.id}
                        value={cur.id}
                        className="whitespace-normal break-words leading-snug max-w-full"
                      >
                        {cur.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>


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
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>


    </>
  )
}
