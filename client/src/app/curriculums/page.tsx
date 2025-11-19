"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import { Button } from "@/components/ui/button"
import { Edit, RefreshCw, Save, ListPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/my-dialog"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { callApi } from "@/lib/callApi"
interface CurriculumsRow {
  curID: string
  curName: string
  curLevel: string
  curMinCr: string
  curBasicCr: string
  curAddCr1: string
  curAddCr2: string
  curAddCr21: string
  curAddCr22: string
  curAddCr23: string
  curActHr: string
  curUseYear: string
}

export default function CurriculumsPage() {
  // ✅ data state
  const [Curriculums, setCurriculums] = useState<CurriculumsRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // ✅ modal state
  const [editingAssign, setEditingAssign] = useState<CurriculumsRow | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // ✅ button state
  const [isEditConfig, setIsEditConfig] = useState(false)

  // ✅ fetch Curriculums function
  const FetchCurriculums = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await callApi<CurriculumsRow[]>(
        "/api/curriculums",
        {
          action: "FetchCurriculums",
        },
        "GET"
      )

      if (!res.success) {
        toast.error(res.message || "ไม่สามารถโหลดข้อมูลหลักสูตรได้")
        return
      }

      const data = res.data
      if (!Array.isArray(data)) {
        toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง")
        return
      }

      const mapped = data.map(cur => ({
        curID: String(cur.curID ?? ""),
          curName: String(cur.curName ?? ""),
          curLevel: String(cur.curLevel ?? ""),
          curMinCr: String(cur.curMinCr ?? ""),
          curBasicCr: String(cur.curBasicCr ?? ""),
          curAddCr1: String(cur.curAddCr1 ?? ""),
          curAddCr2: String(cur.curAddCr2 ?? ""),
          curAddCr21: String(cur.curAddCr21 ?? ""),
          curAddCr22: String(cur.curAddCr22 ?? ""),
          curAddCr23: String(cur.curAddCr23 ?? ""),
          curActHr: String(cur.curActHr ?? ""),
          curUseYear: String(cur.curUseYear ?? "")
      }))

      setCurriculums(mapped)
    } catch (err) {
      console.error("❌ FetchStudents error:", err)
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ✅ fetch Curriculums
  useEffect(() => {
    FetchCurriculums()
  }, [FetchCurriculums])


  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleEditCurriculums = async () => {
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
    FetchCurriculums();
    setIsEditConfig(false)
    setIsEditOpen(false)
  }
  // ✅ columns
  const columns = useMemo(
    () => [
      { accessorKey: "curID", header: "รหัสหลักสูตร", meta: { width: "120px", align: "center" as const } },
      { accessorKey: "curName", header: "ชื่อหลักสูตร", meta: { width: "550px", align: "left" as const } },
      { accessorKey: "curLevel", header: "ระดับ", meta: { width: "150px", align: "center" as const } },
      { accessorKey: "curUseYear", header: "ปีที่เริ่มใช้", meta: { width: "120px", align: "center" as const } },
      {
        accessorKey: "actions",
        header: "ดำเนินการ",
        meta: { width: "150px", align: "center" as const },
        cell: ({ row }: { row: { original: CurriculumsRow } }) => {
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
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap pb-10">
        <Button><ListPlus />เพิ่มหลักสูตร</Button>
      </div>

      {/* ตาราง */}
      <DataTable data={Curriculums} columns={columns} isLoading={isLoading} downloadButton={false} rowHeight="h-15" />

      {/* Modal แก้ไข */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลหลักสูตร</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {editingAssign && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium">ชื่อหลักสูตร</label>
                  <Input
                    value={editingAssign.curName}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curName: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium">ระดับชั้น</label>
                  <Input
                    value={editingAssign.curLevel}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curLevel: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">ปีที่เริ่มใช้</label>
                  <Input
                    value={editingAssign.curUseYear}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curUseYear: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">หน่วยกิตขั้นต่ำ</label>
                  <Input
                    value={editingAssign.curMinCr}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curMinCr: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">หน่วยกิตขั้นต่ำ วิชาพื้นฐาน</label>
                  <Input
                    value={editingAssign.curBasicCr}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curBasicCr: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">หน่วยกิตขั้นต่ำ วิชาเพิ่มเติม กลุ่ม 1</label>
                  <Input
                    value={editingAssign.curAddCr1}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curAddCr1: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">หน่วยกิตขั้นต่ำ วิชาเพิ่มเติม กลุ่ม 2</label>
                  <Input
                    value={editingAssign.curAddCr2}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curAddCr2: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">หน่วยกิตขั้นต่ำ วิชาเพิ่มเติม กลุ่ม 2 (หมวด ก)</label>
                  <Input
                    value={editingAssign.curAddCr21}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curAddCr21: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">หน่วยกิตขั้นต่ำ วิชาเพิ่มเติม กลุ่ม 2 (หมวด ข)</label>
                  <Input
                    value={editingAssign.curAddCr22}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curAddCr22: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">หน่วยกิตขั้นต่ำ วิชาเพิ่มเติม กลุ่ม 2 (หมวด ค)</label>
                  <Input
                    value={editingAssign.curAddCr23}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curAddCr23: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium">ชั่วโมงกิจกรรมขั้นต่ำ</label>
                  <Input
                    value={editingAssign.curActHr}
                    onChange={(e) =>
                      setEditingAssign((prev) =>
                        prev ? { ...prev, curActHr: e.target.value } : prev
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
              onClick={handleEditCurriculums}
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
