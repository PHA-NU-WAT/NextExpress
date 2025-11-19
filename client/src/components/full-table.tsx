"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItemSort,
} from "@/components/ui/dropdown-menu"
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Settings2,
  FileDown,
} from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { useDebouncedCallback } from "use-debounce"

// Metadata
interface MyColumnMeta {
  label?: string
  width?: string
  align?: "left" | "center" | "right"
}

// ColumnDef
export type CustomColumnDef<TData extends object> = ColumnDef<TData> & {
  meta?: MyColumnMeta
}

// Props
interface DataTableProps<TData extends object> {
  data: TData[]
  columns: CustomColumnDef<TData>[]
  defaultPageSize?: number | "full"
  pageSizeOptions?: number[]
  isLoading?: boolean
  rowHeight?: string
  downloadButton?: boolean
}

// Component
export function DataTable<TData extends object>({
  data,
  columns,
  rowHeight,
  downloadButton = true,
  defaultPageSize = 24,
  pageSizeOptions = [24, 48, 72, 96, 120],
}: DataTableProps<TData>) {
  
  const isFull = defaultPageSize === "full"

  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: isFull ? data.length : defaultPageSize,
  })

  React.useEffect(() => {
    if (isFull) {
      setPagination(prev => ({
        ...prev,
        pageSize: data.length,
      }))
    }
  }, [data.length, isFull])

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, columnVisibility, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const debouncedSearch = useDebouncedCallback((val: string) => {
    table.setGlobalFilter(val)
  }, 300)

  // Export CSV
  function exportCSV() {
    const visibleCols = table.getAllLeafColumns().filter(c => c.getIsVisible())
    const headers = visibleCols.map(col =>
      typeof col.columnDef.header === "string" ? col.columnDef.header : col.id
    )
    const exportData = table.getFilteredRowModel().rows.map(r => {
      const rowObj: Record<string, unknown> = {}
      visibleCols.forEach(col => (rowObj[col.id] = r.getValue(col.id)))
      return rowObj
    })
    const csv = Papa.unparse({
      fields: headers,
      data: exportData.map(row => Object.values(row)),
    })
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "export.csv")
  }

  // Export Excel
  function exportExcel() {
    const visibleCols = table.getAllLeafColumns().filter(c => c.getIsVisible())
    const headers = visibleCols.map(col =>
      typeof col.columnDef.header === "string" ? col.columnDef.header : col.id
    )
    const exportData = table.getFilteredRowModel().rows.map(r => {
      const rowObj: Record<string, unknown> = {}
      visibleCols.forEach(col => (rowObj[col.id] = r.getValue(col.id)))
      return rowObj
    })
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exportData.map(row => Object.values(row))])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
    saveAs(
      new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], {
        type: "application/octet-stream",
      }),
      "export.xlsx"
    )
  }

  // Render
  return (
    <div className="relative space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">

        {/* Row-per-page selector → ซ่อนถ้า full mode */}
        {!isFull && (
          <div className="text-sm flex gap-2 items-center">
            แสดง
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={val => table.setPageSize(Number(val))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            แถว
          </div>
        )}

        {/* Search + Export */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center sm:ml-auto w-full sm:w-auto">
          <Input
            placeholder="ค้นหา..."
            defaultValue={globalFilter}
            onChange={e => debouncedSearch(e.target.value)}
            className="w-full"
          />

          <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Settings2 />
                  แสดง
                  <ChevronsUpDown className="ml-auto opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllLeafColumns().map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={val => column.toggleVisibility(!!val)}
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {downloadButton && (
              <>
                <Button onClick={exportCSV} className="w-full sm:w-auto" variant="outline">
                  <FileDown /> CSV
                </Button>
                <Button onClick={exportExcel} className="w-full sm:w-auto" variant="outline">
                  <FileDown /> Excel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="text-center"
                    style={{
                      width:
                        (header.column.columnDef as CustomColumnDef<TData>).meta?.width || "150px",
                    }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="justify-between">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="ml-auto" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="ml-auto" />
                          ) : (
                            <ChevronsUpDown className="ml-auto opacity-50" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItemSort header={header} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className={rowHeight}>
                  {row.getVisibleCells().map(cell => {
                    const meta = (cell.column.columnDef as CustomColumnDef<TData>).meta
                    return (
                      <TableCell
                        key={cell.id}
                        style={{ minWidth: meta?.width || "150px" }}
                        className={`whitespace-nowrap ${
                          meta?.align === "center"
                            ? "text-center"
                            : meta?.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination → ซ่อนถ้า full */}
      {!isFull && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            หน้า {pagination.pageIndex + 1} จาก {table.getPageCount()}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <Button variant="outline" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm">
              <ChevronsLeft />
            </Button>
            <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm">
              <ChevronLeft />
            </Button>

            {(() => {
              const total = table.getPageCount()
              const cur = pagination.pageIndex
              const offsets = [-1, 0, 1]
              return offsets.map((o, i) => {
                const p = cur + o
                if (p < 0 || p >= total) return null
                return (
                  <Button
                    key={i}
                    variant={p === cur ? "default" : "outline"}
                    onClick={() => table.setPageIndex(p)}
                    className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm"
                  >
                    {p + 1}
                  </Button>
                )
              })
            })()}

            <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm">
              <ChevronRight />
            </Button>
            <Button variant="outline" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm">
              <ChevronsRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
