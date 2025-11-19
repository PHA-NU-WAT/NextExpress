"use client";
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import type Handsontable from "handsontable";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";

import { registerAllModules } from "handsontable/registry";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Save,
  RefreshCw,
  Calculator,
} from "lucide-react";
import toast from "react-hot-toast";
import { callApi } from "@/lib/callApi";

registerAllModules();
import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import "@/styles/handsontable-shadcn.css";

// ✅ Type ของแถวข้อมูลคะแนน
interface ScoreRow {
  xClass: string;
  sNo: string;
  sID: string;
  fullname: string;
  score1: string | number;
  score2: string | number;
  score3: string | number;
  score4: string | number;
  score5: string | number;
  scoreMid: string | number;
  score6: string | number;
  score7: string | number;
  score8: string | number;
  score9: string | number;
  score10: string | number;
  scoreFinal: string | number;
  scorePercent: string | number;
  grade: string | number;
  remark: string;
}

export default function ScoreTable() {
  const { theme } = useTheme();
  const themeName = theme === "dark" ? "ht-theme-main-dark" : "ht-theme-main";

  const [pageSize, setPageSize] = useState(24);
  const [pageIndex, setPageIndex] = useState(0);

  const [scores, setScores] = useState<ScoreRow[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("1");

  // ✅ ref ที่รองรับ TypeScript เต็มรูปแบบ
  const hotRef = useRef<{ hotInstance: Handsontable } | null>(null);

  // ✅ ดึงข้อมูลคะแนนจาก API
  const FetchScore = async () => {
    if (isReloading) return;
    setIsReloading(true);

    const loadingToast = toast.loading("กำลังโหลดข้อมูล...");

    try {
      const params = new URLSearchParams({
        action: "FetchScore",
        subject: selectedSubject,
        group: selectedGroup,
      });

      const res = await fetch(`/api/evaluation?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data: ScoreRow[] = await res.json();

      const filled = [
        ...data,
        ...Array.from({ length: Math.max(0, 24 - data.length) }, () => ({
          xClass: "",
          sNo: "",
          sID: "",
          fullname: "",
          score1: "",
          score2: "",
          score3: "",
          score4: "",
          score5: "",
          scoreMid: "",
          score6: "",
          score7: "",
          score8: "",
          score9: "",
          score10: "",
          scoreFinal: "",
          scorePercent: "",
          grade: "",
          remark: "",
        })),
      ];

      setScores(filled);
      toast.dismiss(loadingToast);
    } catch (err) {
      console.error(err);
      toast.error(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${String(err)}`);
    } finally {
      setIsReloading(false);
    }
  };

  // ✅ โหลดข้อมูลครั้งแรก (สร้างแถวว่าง)
  useEffect(() => {
    setScores(
      Array.from({ length: 24 }, () => ({
        xClass: "",
        sNo: "",
        sID: "",
        fullname: "",
        score1: "",
        score2: "",
        score3: "",
        score4: "",
        score5: "",
        scoreMid: "",
        score6: "",
        score7: "",
        score8: "",
        score9: "",
        score10: "",
        scoreFinal: "",
        scorePercent: "",
        grade: "",
        remark: "",
      }))
    );
  }, []);

  // ✅ โหลดข้อมูลใหม่เมื่อเปลี่ยนตัวเลือก
  useEffect(() => {
    if (!selectedSubject || !selectedGroup) return;
    FetchScore();
  }, [selectedSubject, selectedGroup]);

  // ✅ แปลงข้อมูลให้ Handsontable ใช้
  const rearrangedData = useMemo(
    () =>
      scores.map((r) => [
        r.xClass,
        r.sNo,
        r.sID,
        r.fullname,
        r.score1,
        r.score2,
        r.score3,
        r.score4,
        r.score5,
        r.scoreMid,
        r.score6,
        r.score7,
        r.score8,
        r.score9,
        r.score10,
        r.scoreFinal,
        r.scorePercent,
        r.grade,
        r.remark,
      ]),
    [scores]
  );

  // ✅ คะแนนเต็ม
  const maxScores = useMemo<Record<number, number>>(
    () => ({
      4: 10,
      5: 10,
      6: 10,
      7: 0,
      8: 0,
      9: 20,
      10: 10,
      11: 10,
      12: 0,
      13: 0,
      14: 0,
      15: 30,
    }),
    []
  );

  // ✅ Columns
  const columns = useMemo<Handsontable.ColumnSettings[]>(
    () => [
      { type: "text", className: "htCenter htMiddle", readOnly: true },
      { type: "numeric", className: "htCenter htMiddle", readOnly: true },
      { type: "text", className: "htCenter htMiddle", readOnly: true },
      { type: "text", width: 150, className: "htLeft htMiddle", readOnly: true },
      ...Array.from({ length: 15 }, (_, i) => ({
        type: "text",
        className: "htCenter htMiddle",
        readOnly: maxScores[i + 4] === 0,
      })),
      { type: "text", className: "htCenter htMiddle", readOnly: true },
      { type: "text", className: "htCenter htMiddle", readOnly: true },
      { type: "text", className: "htCenter htMiddle" },
    ],
    [maxScores]
  );

  // ✅ Pagination
  const totalRows = rearrangedData.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = pageIndex * pageSize;
  const endRow = startRow + pageSize;
  const visibleData = useMemo(
    () => rearrangedData.slice(startRow, endRow),
    [rearrangedData, startRow, endRow]
  );

  useEffect(() => setPageIndex(0), [pageSize]);

  // ✅ คำนวณเกรด
  const handleCalculate = useCallback(async () => {
    if (isCalculating) return;
    setIsCalculating(true);

    try {
      const hot = hotRef.current?.hotInstance;
      if (!hot) return;
      const data = hot.getData();

      const updated = data.map((row) => {
        let total = 0;

        for (const [colIndex, max] of Object.entries(maxScores)) {
          const idx = Number(colIndex);
          const rawVal = row[idx];
          if (rawVal === "" || rawVal == null) continue;
          const val = Number(rawVal);
          if (!isNaN(val) && max > 0) total += val;
        }

        const maxTotal = Object.values(maxScores).reduce(
          (sum, max) => (max > 0 ? sum + max : sum),
          0
        );
        const percent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

        const grade =
          percent >= 80
            ? "4"
            : percent >= 75
              ? "3.5"
              : percent >= 70
                ? "3"
                : percent >= 65
                  ? "2.5"
                  : percent >= 60
                    ? "2"
                    : percent >= 55
                      ? "1.5"
                      : percent >= 50
                        ? "1"
                        : "0";

        const newRow = [...row];
        newRow[16] = percent.toFixed(1);
        newRow[17] = grade;
        return newRow;
      });

      const newScores: ScoreRow[] = updated.map((r) => ({
        xClass: String(r[0] ?? ""),
        sNo: String(r[1] ?? ""),
        sID: String(r[2] ?? ""),
        fullname: String(r[3] ?? ""),
        score1: r[4] ?? "",
        score2: r[5] ?? "",
        score3: r[6] ?? "",
        score4: r[7] ?? "",
        score5: r[8] ?? "",
        scoreMid: r[9] ?? "",
        score6: r[10] ?? "",
        score7: r[11] ?? "",
        score8: r[12] ?? "",
        score9: r[13] ?? "",
        score10: r[14] ?? "",
        scoreFinal: r[15] ?? "",
        scorePercent: r[16] ?? "",
        grade: r[17] ?? "",
        remark: String(r[18] ?? ""),
      }));

      await new Promise((r) => setTimeout(r, 500));
      setScores(newScores);
      toast.success("คำนวณเปอร์เซ็นต์และเกรดเรียบร้อย!");
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาดในการคำนวณ: ${String(err)}`);
    } finally {
      setIsCalculating(false);
    }
  }, [isCalculating, maxScores]);

  // ✅ ตรวจสอบค่าก่อนบันทึก
  const handleBeforeChange = useCallback(
    (changes: (Handsontable.CellChange | null)[], _source: Handsontable.ChangeSource) => {
      if (!changes) return;

      for (const change of changes) {
        if (!change) continue;

        const [, prop, , newValue] = change;
        const colIndex = Number(
          hotRef.current?.hotInstance?.propToCol(prop as string | number) ?? 0
        );
        const max = maxScores[colIndex];
        if (max === undefined || max === 0) continue;

        if (newValue === "" || newValue == null) {
          change[3] = null;
          continue;
        }

        const numericValue = Number(newValue);
        if (isNaN(numericValue)) {
          change[3] = null;
          continue;
        }

        const fixedValue =
          Number.isInteger(numericValue) || numericValue % 1 === 0
            ? parseInt(numericValue.toString(), 10)
            : numericValue;

        if (fixedValue > max) change[3] = max;
        else if (fixedValue < 0) change[3] = 0;
        else change[3] = fixedValue;
      }
    },
    [maxScores]
  );


  // ✅ Save
  const handleSaveScore = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    try {
      const newData = hot.getData();
      const { newscores, updatedScores } = newData.reduce(
        (acc, r) => {
          const recordForSave = {
            action: "SaveScore",
            xYear: 2568,
            xTerm: 1,
            schoolID: 10,
            subjectID: selectedSubject,
            xGroup: selectedGroup,
            xClass: r[0],
            sID: r[2],
            fullname: r[3],
            score1: r[4] || null,
            score2: r[5] || null,
            score3: r[6] || null,
            score4: r[7] || null,
            score5: r[8] || null,
            scoreMid: r[9] || null,
            score6: r[10] || null,
            score7: r[11] || null,
            score8: r[12] || null,
            score9: r[13] || null,
            score10: r[14] || null,
            scoreFinal: r[15] || null,
            scorePercent: r[16] || null,
            grade: r[17] || null,
            remark: r[18] || null,
          };

          const recordForUI: ScoreRow = {
            xClass: String(r[0] ?? ""),
            sNo: String(r[1] ?? ""),
            sID: String(r[2] ?? ""),
            fullname: String(r[3] ?? ""),
            score1: r[4] ?? "",
            score2: r[5] ?? "",
            score3: r[6] ?? "",
            score4: r[7] ?? "",
            score5: r[8] ?? "",
            scoreMid: r[9] ?? "",
            score6: r[10] ?? "",
            score7: r[11] ?? "",
            score8: r[12] ?? "",
            score9: r[13] ?? "",
            score10: r[14] ?? "",
            scoreFinal: r[15] ?? "",
            scorePercent: r[16] ?? "",
            grade: r[17] ?? "",
            remark: String(r[18] ?? ""),
          };

          acc.newscores.push(recordForSave);
          acc.updatedScores.push(recordForUI);
          return acc;
        },
        { newscores: [] as Record<string, unknown>[], updatedScores: [] as ScoreRow[] }
      );

      setScores(updatedScores);
      console.log(newscores);

      const res = await callApi("/api/evaluation", {
        action: "SaveScore",
        scores: newscores,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("บันทึกคะแนนสำเร็จ!");
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${String(err)}`);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, selectedGroup, selectedSubject]);

  // ✅ Render
  return (
    <div>
      {/* Filters */}
      <div className="flex justify-between flex-col sm:flex-row gap-4 flex-wrap pb-10 text-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          {/* รายวิชา */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold">รายวิชา :</span>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="เลือกรายวิชา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTH101">MTH101 คณิตศาสตร์</SelectItem>
                <SelectItem value="SCI101">SCI101 วิทยาศาสตร์</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* กลุ่ม */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold">กลุ่ม :</span>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="เลือกกลุ่ม" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
        {/* ซ้าย: คุมจำนวนแถว */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-2 items-center">
            <span>แสดง</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="24" />
              </SelectTrigger>
              <SelectContent>
                {[24, 48, 72, 96].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>แถว</span>
          </div>
        </div>
        {/* ขวา: ปุ่มคำสั่ง — บนมือถือให้ห่อ และเต็มความกว้าง */}
        
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap sm:w-auto ">
          <Button onClick={handleCalculate} disabled={isCalculating}>
            {isCalculating ? (
              <>
                <RefreshCw className="animate-spin" /> กำลังคำนวณ...
              </>
            ) : (
              <>
                <Calculator /> คำนวณเกรด
              </>
            )}
          </Button>
          <Button onClick={handleSaveScore} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin" /> กำลังบันทึก...
              </>
            ) : (
              <>
                <Save /> บันทึกคะแนน
              </>
            )}
          </Button>
          <Button variant="outline" onClick={FetchScore} disabled={isReloading}>
            {isReloading ? (
              <>
                <RefreshCw className="animate-spin" /> รีโหลด
              </>
            ) : (
              <>
                <RefreshCw /> รีโหลด
              </>
            )}
          </Button>
        </div>
      </div>


      {/* ตารางคะแนน */}
      <HotTable
        ref={hotRef}
        data={visibleData}
        columns={columns}
        rowHeaders
        nestedHeaders={[
          [
            { label: "", colspan: 4 },
            { label: "คะแนนระหว่างเรียน", colspan: 6 },
            { label: "คะแนนหลังกลางภาค", colspan: 6 },
            { label: "สรุปผล", colspan: 5 },
          ],
          [
            { label: "", colspan: 4 },
            ...Array.from({ length: 12 }, (_, i) => ({
              label: maxScores[i + 4]?.toString() ?? "",
              colspan: 1,
            })),
            { label: "100", colspan: 1 },
            { label: "", colspan: 4 },
          ],
          [
            "ห้อง",
            "เลขที่",
            "เลขประจำตัว",
            "ชื่อ-สกุล",
            "1",
            "2",
            "3",
            "4",
            "5",
            "กลางภาค",
            "6",
            "7",
            "8",
            "9",
            "10",
            "ปลายภาค",
            "%",
            "เกรด",
            "หมายเหตุ",
          ],
        ]}
        height="auto"
        stretchH="all"
        themeName={themeName}
        manualColumnResize
        manualRowResize
        contextMenu={false}
        beforeChange={handleBeforeChange}
        className="z-0"
        licenseKey="non-commercial-and-evaluation"
      // fixedColumnsStart={2}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          หน้า {pageIndex + 1} จาก {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageIndex === totalPages - 1}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            onClick={() => setPageIndex(totalPages - 1)}
            disabled={pageIndex === totalPages - 1}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
