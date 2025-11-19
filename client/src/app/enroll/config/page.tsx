"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { RefreshCw, ListPlus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { callApi } from "@/lib/callApi"
import { IOSSwitch } from "@/components/ios-switch"
interface configRow {
  xYear: string
  xTerm: string
  xClass: string
  curID: string
  curName: string
  xMaxAddCr2: string
  xOpenEnroll: boolean
}




export default function SubjectsPage() {
  // ✅ state ของ filter
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")


  // ✅ data state
  const [Subjects, setSubjects] = useState<configRow[]>([])
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
        curName: String(x.curName ?? ""),
        xMaxAddCr2:
          x.xMaxAddCr2 != null
            ? (Number(x.xMaxAddCr2) % 1 === 0
              ? String(parseInt(String(x.xMaxAddCr2)))
              : String(Number(x.xMaxAddCr2)))
            : "",
        xOpenEnroll: Boolean(x.xOpenEnroll ?? false)
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
  const handleAssignConfigMaxAddCr2 = async () => {
    if (isAssignConfig) return
    setIsAssignConfig(true)
    const res = await callApi("/api/enroll", {
      action: "AssignConfigMaxAddCr2",
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
  const handleCancelConfigMaxAddCr2 = async () => {
    if (isCancelConfig) return
    setIsCancelConfig(true)
    const res = await callApi("/api/enroll", {
      action: "CancelConfigMaxAddCr2",
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
  const handleEditConfigMaxAddCr2 = useCallback(
    async (rowData: configRow, newValue: string) => {
      // อัปเดตค่าใน UI ทันที (optimistic update)
      setSubjects(prev =>
        prev.map(r =>
          r.xYear === rowData.xYear &&
            r.xTerm === rowData.xTerm &&
            r.xClass === rowData.xClass
            ? { ...r, xMaxAddCr2: newValue }
            : r
        )
      )

      // ยิง API ไปอัปเดตในฐานข้อมูล
      const res = await callApi("/api/enroll", {
        action: "EditConfigMaxAddCr2",
        year: rowData.xYear,
        term: rowData.xTerm,
        classroom: rowData.xClass.replace("ม.", ""),
        xMaxAddCr2: newValue,
      })

      if (!res.success) {
        toast.error(res.message)
        // rollback ถ้า error
        setSubjects(prev =>
          prev.map(r =>
            r.xYear === rowData.xYear &&
              r.xTerm === rowData.xTerm &&
              r.xClass === rowData.xClass
              ? { ...r, xMaxAddCr2: rowData.xMaxAddCr2 }
              : r
          )
        )
        return
      }

      toast.success(res.message)
    },
    []
  )

  const handleToggleOpenEnroll = useCallback(
    async (rowData: configRow, newValue: boolean) => {
      // update UI ทันที (optimistic update)
      setSubjects((prev) =>
        prev.map((r) =>
          r.xYear === rowData.xYear &&
            r.xTerm === rowData.xTerm &&
            r.xClass === rowData.xClass
            ? { ...r, xOpenEnroll: newValue }
            : r
        )
      )

      const res = await callApi("/api/enroll", {
        action: "ToggleOpenEnroll",
        year: rowData.xYear,
        term: rowData.xTerm,
        classroom: rowData.xClass.replace("ม.", ""),
        xOpenEnroll: newValue ? "1" : "0",
      })

      console.log("ToggleOpenEnroll response:", res)

      if (!res.success) {
        toast.error(res.message)
        // rollback UI
        setSubjects((prev) =>
          prev.map((r) =>
            r.xYear === rowData.xYear &&
              r.xTerm === rowData.xTerm &&
              r.xClass === rowData.xClass
              ? { ...r, xOpenEnroll: !newValue }
              : r
          )
        )
        return
      }
      toast.success(res.message)
    },
    []
  )



  // ✅ columns
  const columns = useMemo(
    () => [
      { accessorKey: "xYear", header: "ปีการศึกษา", meta: { width: "100px", align: "center" as const } },
      { accessorKey: "xTerm", header: "ภาคเรียน", meta: { width: "100px", align: "center" as const } },
      { accessorKey: "xClass", header: "ระดับชั้น", meta: { width: "100px", align: "center" as const } },
      { accessorKey: "curName", header: "หลักสูตรที่ใช้", meta: { width: "520px", align: "left" as const } },
      {
        accessorKey: "xMaxAddCr2",
        header: "หน่วยกิตวิชาเพิ่มเติม กลุ่ม 2",
        meta: { width: "220px", align: "center" as const },
        cell: ({ row }: { row: { original: configRow } }) => {
          const { original } = row
          return (
            <span className="flex justify-center">
              <Input
                className="w-20 text-center"
                type="number"
                min={0}
                value={original.xMaxAddCr2}
                onChange={(e) => handleEditConfigMaxAddCr2(original, e.target.value)}
              />
            </span>
          )
        },
      },
      {
        accessorKey: "xOpenEnroll",
        header: "เปิด-ปิด ลงทะเบียน",
        meta: { width: "170px", align: "center" as const },
        cell: ({ row }: { row: { original: configRow } }) => {
          const { original } = row
          return (
            <IOSSwitch
              checked={original.xOpenEnroll}
              onCheckedChange={(checked) => handleToggleOpenEnroll(original, checked)}
            />
          )
        },
      },
    ],
    [handleEditConfigMaxAddCr2, handleToggleOpenEnroll]
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
            onClick={handleAssignConfigMaxAddCr2}
          >
            {isAssignConfig ? (
              <>
                <RefreshCw className="animate-spin" /> กำลังนำเข้าข้อมูล...
              </>
            ) : (
              <>
                <ListPlus /> นำเข้าจากปีก่อนหน้า
              </>
            )}

          </Button>
          <Button variant="outline" onClick={handleCancelConfigMaxAddCr2}>
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
    </>
  )
}
