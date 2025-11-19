"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTable } from "@/components/full-table"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Trash2, ArrowDown01, ListPlus, RefreshCw } from "lucide-react"
import { StudentImage } from "@/components/student-image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { callApi } from "@/lib/callApi"

const classesByGrade: Record<string, string[]> = {
    "1": ["1", "2", "3", "4"],
    "2": ["1", "2", "3", "4"],
    "3": ["1", "2", "3", "4"],
    "4": ["1", "2", "3", "4", "5", "6"],
    "5": ["1", "2", "3", "4", "5", "6"],
    "6": ["1", "2", "3", "4", "5", "6"],
}

// 🔹 type ของนักเรียน
interface StudentRow {
    sNo: string
    sPrefix?: string
    sFirstname?: string
    sLastname?: string
    fullname: string
    sID: string
    sClass: string
    sRoom: string
}


export default function StudentsPage() {
    // ✅ state ของ filter
    const [selectedYear, setSelectedYear] = useState<string>("")
    const [selectedTerm, setSelectedTerm] = useState<string>("")
    const [selectedClass, setselectedClass] = useState<string>("1")
    const [selectedRoom, setselectedRoom] = useState<string>("1")

    const [sortBy, setSortBy] = useState<string>("gender_name_lastname")


    // ✅ data state
    const [students, setStudents] = useState<StudentRow[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const [isClassroomAssign, setIsClassroomAssign] = useState(false)
    const [isCancelClassroomAssign, setIsCancelClassroomAssign] = useState(false)
    const [isSeatNoAssign, setIsSeatNoAssign] = useState(false)
    const [isCancelSeatNoAssign, setIsCancelSeatNoAssign] = useState(false)
    const [isStudentPromotion, setIsStudentPromotion] = useState(false)
    const [isDeleteStudent, setIsDeleteStudent] = useState(false)

    const [studentIDs, setStudentIDs] = useState<string>("")

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

    const FetchStudents = useCallback(async () => {
        if (!selectedYear || !selectedTerm) return

        setIsLoading(true)
        try {
            const res = await callApi<StudentRow[]>(
                "/api/students",
                {
                    action: "FetchStudents",
                    xYear: selectedYear,
                    xTerm: selectedTerm,
                    sClass: selectedClass === "all" ? "all" : selectedClass.replace("ม.", ""),
                    sRoom: selectedRoom,
                },
                "GET"
            )

            if (!res.success) {
                console.warn("⚠️ FetchStudentsPublic failed:", res.message)
                return
            }

            const data = res.data

            if (Array.isArray(data)) {
                const mapped: StudentRow[] = data.map((stu) => ({
                    sNo: String(stu.sNo ?? ""),
                    sPrefix: String(stu.sPrefix ?? ""),
                    sFirstname: String(stu.sFirstname ?? ""),
                    sLastname: String(stu.sLastname ?? ""),
                    fullname: `${stu.sPrefix ?? ""}${stu.sFirstname ?? ""} ${stu.sLastname ?? ""}`,
                    sID: String(stu.sID ?? ""),
                    sClass: `มัธยมศึกษาปีที่ ${stu.sClass ?? ""}`,
                    sRoom: `${stu.sClass ?? ""}0${stu.sRoom ?? ""}`,
                }))
                setStudents(mapped)
            } else {
                console.warn("⚠️ Invalid response structure:", data)
            }
        } catch (err) {
            console.error("❌ fetch error:", err)
        } finally {
            setIsLoading(false)
        }
    }, [selectedYear, selectedTerm, selectedClass, selectedRoom])

    // ✅ fetch students
    useEffect(() => {
        FetchStudents()
    }, [FetchStudents])

    // ✅ function
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const handleClassroomAssign = async () => {
        if (isClassroomAssign) return
        setIsClassroomAssign(true)

        const studentList = studentIDs
            .split("\n")
            .map((id) => id.trim())
            .filter((id) => id !== "")

        console.log(studentList)


        const res = await callApi("/api/classroom", {
            action: "ClassroomAssign",
            sortBy,
            year: selectedYear,
            term: selectedTerm,
            classroom: selectedClass,
            room: selectedRoom,
            sid: studentList
        })

        await sleep(400);

        if (!res.success) {
            toast.error(res.message)
            setIsClassroomAssign(false)
            return
        }

        toast.success(res.message)
        FetchStudents();
        setIsClassroomAssign(false)
        setStudentIDs("")
    }
    const handleCancelClassroomAssign = async () => {
        if (isCancelClassroomAssign) return
        setIsCancelClassroomAssign(true)
        const res = await callApi("/api/classroom", {
            action: "CancelClassroomAssign",
            sortBy,
            year: selectedYear,
            term: selectedTerm,
            classroom: selectedClass,
            room: selectedRoom,
        })

        await sleep(400);

        if (!res.success) {
            toast.error(res.message)
            setIsCancelClassroomAssign(false)
            return
        }

        toast.success(res.message)
        FetchStudents();
        setIsCancelClassroomAssign(false)
    }
    const handleSeatNoAssign = async () => {
        if (isSeatNoAssign) return
        setIsSeatNoAssign(true)

        const res = await callApi("/api/classroom", {
            action: "SeatNoAssign",
            sortBy,
            year: selectedYear,
            term: selectedTerm,
            classroom: selectedClass,
            room: selectedRoom,
        })

        await sleep(400);

        if (!res.success) {
            toast.error(res.message)
            setIsSeatNoAssign(false)
            return
        }

        toast.success(res.message)
        FetchStudents();
        setIsSeatNoAssign(false)
    }
    const handleCancelSeatNoAssign = async () => {
        if (isCancelSeatNoAssign) return
        setIsCancelSeatNoAssign(true)

        const res = await callApi("/api/classroom", {
            action: "CancelSeatNoAssign",
            sortBy,
            year: selectedYear,
            term: selectedTerm,
            classroom: selectedClass,
            room: selectedRoom,
        })

        await sleep(400);

        if (!res.success) {
            toast.error(res.message)
            setIsCancelSeatNoAssign(false)
            return
        }

        toast.success(res.message)
        FetchStudents();
        setIsCancelSeatNoAssign(false)
    }
    const handleStudentPromotion = async () => {
        if (isStudentPromotion) return
        setIsStudentPromotion(true)
        const res = await callApi("/api/classroom", {
            action: "StudentPromotion",
            sortBy,
            year: selectedYear,
            term: selectedTerm,
            classroom: selectedClass,
            room: selectedRoom,
        })

        await sleep(400);

        if (!res.success) {
            toast.error(res.message)
            setIsStudentPromotion(false)
            return
        }

        toast.success(res.message)
        FetchStudents();
        setIsStudentPromotion(false)
    }
    const handleDeleteStudent = useCallback(async (sID: string) => {
        if (isDeleteStudent) return
        setIsDeleteStudent(true)

        const res = await callApi("/api/classroom", {
            action: "DeleteStudent",
            sortBy,
            year: selectedYear,
            term: selectedTerm,
            classroom: selectedClass,
            room: selectedRoom,
            sid: sID,
        })

        await sleep(400)

        if (!res.success) {
            toast.error(res.message)
            setIsDeleteStudent(false)
            return
        }

        toast.success(res.message)
        FetchStudents()
        setIsDeleteStudent(false)
    }, [isDeleteStudent, sortBy, selectedYear, selectedTerm, selectedClass, selectedRoom, FetchStudents])


    // ✅ columns
    const columns = useMemo(
        () => [
            {
                accessorKey: "fullname",
                header: "ชื่อ-สกุล",
                meta: { width: "300px", align: "left" as const },
                cell: ({ row }: { row: { original: StudentRow } }) => {
                    const { sID, fullname } = row.original
                    return (
                        <div className="flex items-center">
                            <div className="w-[60px] h-[60px] rounded-full border-[3px] border-[#d9dcdf] dark:border-[#d9dcdf]/10 overflow-hidden mr-2">
                                <StudentImage key={sID} sID={sID} fullname={fullname} />
                            </div>
                            <span>{fullname}</span>
                        </div>
                    )
                },
            },
            { accessorKey: "sID", header: "รหัสนักเรียน", meta: { width: "150px", align: "center" as const } },
            { accessorKey: "sClass", header: "ระดับชั้น", meta: { width: "150px", align: "center" as const } },
            { accessorKey: "sRoom", header: "ห้อง", meta: { width: "100px", align: "center" as const } },
            { accessorKey: "sNo", header: "เลขที่", meta: { width: "100px", align: "center" as const } },
            {
                accessorKey: "actions",
                header: "ดำเนินการ",
                meta: { width: "150px", align: "center" as const },
                cell: ({ row }: { row: { original: StudentRow } }) => {
                    const { sID } = row.original
                    return (
                        <Button
                            data-sidebar="trigger"
                            data-slot="sidebar-trigger"
                            variant="ghost"
                            size="icon"
                            // className="bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500"
                            className="bg-background dark:bg-input/30 dark:hover:bg-input/50"
                            onClick={() => handleDeleteStudent(sID)}  // ✅ ส่ง sID จากแถวนั้น
                        >
                            <Trash2 />
                        </Button>
                    )
                },
            },

        ],
        [handleDeleteStudent]
    )

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap pb-10 text-sm">
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
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap font-bold">ระดับชั้น :</span>
                    <Select
                        value={selectedClass}
                        onValueChange={(val) => {
                            setselectedClass(val)
                            const roomNum = Number(selectedRoom)
                            if (!isNaN(roomNum) && roomNum > 4) {
                                setselectedRoom("")
                            }
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="เลือกระดับชั้น" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(classesByGrade).map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                    ม.{grade}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* ห้อง */}
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap font-bold">ห้อง :</span>
                    <Select value={selectedRoom} onValueChange={setselectedRoom}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="เลือกห้อง" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedClass !== "all" &&
                                classesByGrade[selectedClass]?.map((room) => (
                                    <SelectItem key={room} value={room}>
                                        {`${selectedClass}0${room}`}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>




            <div className="flex flex-col xl:flex-row gap-6">
                <div className="w-full xl:w-8/12">
                    <div className="flex justify-end flex-col sm:flex-row gap-4 flex-wrap pb-5">
                        {/* เรียงเลขที่จาก */}
                        <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap font-bold">เรียงเลขที่จาก :</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="เรียงเลขที่จาก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gender_name_lastname">
                                        เพศ &gt; ชื่อ &gt; นามสกุล
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                className="flex-1 sm:flex-none"
                                onClick={handleSeatNoAssign}
                            >
                                {isSeatNoAssign ? (
                                    <>
                                        <RefreshCw className="animate-spin" /> กำลังยกเลิก...
                                    </>
                                ) : (
                                    <>
                                        <ArrowDown01 /> จัดเลขที่
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={handleCancelSeatNoAssign}
                            >
                                {isCancelSeatNoAssign ? (
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
                    <DataTable data={students} columns={columns} isLoading={isLoading} rowHeight="h-18" />
                </div>

                <div className="w-full xl:w-4/12">
                    <div className="grid w-full gap-2">
                        <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap font-bold">จัดห้องโดยอัตโนมัติ :</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    className="flex-1 sm:flex-none"
                                    onClick={handleStudentPromotion}
                                    disabled={selectedTerm === "1" && (selectedClass === "1" || selectedClass === "4")}
                                >

                                    {isStudentPromotion ? (
                                        <>
                                            <RefreshCw className="animate-spin" /> กำลังนำเข้าข้อมูล...
                                        </>
                                    ) : (
                                        <>
                                            <ListPlus /> {selectedTerm === "2" ? "นำเข้าจากภาคเรียนที่ 1" : "นำเข้าจากปีก่อนหน้า"}
                                        </>
                                    )}

                                </Button>
                            </div>
                        </div>
                        <span className="font-bold">จัดห้องโดยการกรอกรหัส :</span>
                        <Textarea
                            className="h-[518px]"
                            placeholder="กรอกรหัสนักเรียน (โดยเว้นบรรทัด)"
                            value={studentIDs}
                            onChange={(e) => setStudentIDs(e.target.value)} />
                        <Button onClick={handleClassroomAssign}>
                            {isClassroomAssign ? (
                                <>
                                    <RefreshCw className="animate-spin" /> กำลังจัดนักเรียนเข้าชั้น...
                                </>
                            ) : (
                                <>
                                    <ListPlus /> จัดนักเรียนเข้าชั้น
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleCancelClassroomAssign}>
                            {isCancelClassroomAssign ? (
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
            </div>
        </>
    )
}
