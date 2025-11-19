"use client"

import { DataTable } from "@/components/full-table"
import { ColumnDef } from "@tanstack/react-table"
import { ChevronsUpDown, EllipsisVertical, SquarePen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ✅ ไม่ต้อง import Data อีกต่อไป

// ให้ generic รองรับชนิดข้อมูลจริงที่ใช้ใน Calendar (Event)
export interface EventData {
  id: string
  title: string
  start: string
  end?: string
  color: string
  calendarName: string
}

// ✅ columns จะเป็น ColumnDef<EventData>[] 
const columns: ColumnDef<EventData>[] = [
  {
    id: "select",
    meta: { label: "เลือก" },
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center h-full">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
  },
  {
    accessorKey: "calendarName",
    meta: { label: "ปฏิทิน" },
    header: "ปฏิทิน",
    cell: ({ row }) => {
      const color = row.original.color
      const name = row.original.calendarName
      return (
        <div className="flex items-center">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: color }}
          />
          {name}
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    meta: { label: "ชื่อกิจกรรม" },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ชื่อกิจกรรม
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-xl truncate" title={row.getValue("title")}>
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "start",
    meta: { label: "วันที่เริ่ม" },
    header: "วันที่เริ่ม",
    cell: ({ row }) => {
      const start = new Date(row.getValue("start"))
      return (
        <div className="flex justify-center items-center h-full">
          {start.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "end",
    meta: { label: "วันที่สิ้นสุด" },
    header: "วันที่สิ้นสุด",
    cell: ({ row }) => {
      const endevent = row.getValue("end")
      if (!endevent || typeof endevent !== "string") {
        return <div className="text-center">-</div>
      }
      const endDate = new Date(endevent)
      return (
        <div className="flex justify-center items-center h-full">
          {endDate.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </div>
      )
    },
  },
  {
    id: "actions",
    meta: { label: "ดำเนินการ" },
    header: "ดำเนินการ",
    cell: () => {
      return (
        <div className="flex justify-center items-center h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg"
              side="right"
              align="start"
            >
              <DropdownMenuItem>
                <SquarePen className="text-muted-foreground" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="text-muted-foreground" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// ✅ FullTable เป็น generic ที่ใช้กับข้อมูลชนิดใดก็ได้
interface FullTableProps<TData extends object> {
  data: TData[]
  rowHeight?: string
}

export default function FullTable<TData extends object>({
  data,
}: FullTableProps<TData>) {
  return <DataTable data={data} columns={columns as ColumnDef<TData>[]} />
}
