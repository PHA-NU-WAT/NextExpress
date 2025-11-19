"use client"

import { useEffect, useState, useMemo } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Card, CardContent } from "@/components/ui/card"
import FullTable from "@/components/datatable/table-calendar"

// ✅ Type ของกิจกรรมในระบบ
interface Event {
  id: string
  title: string
  start: string
  end?: string
  calendarId: string
  color: string
  calendarName: string
}

// ✅ Type ของ event ที่มาจาก Google Calendar API
interface GoogleCalendarEvent {
  id: string
  summary?: string
  start?: { date?: string; dateTime?: string }
  end?: { date?: string; dateTime?: string }
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [visibleEvents, setVisibleEvents] = useState<Event[]>([])
  const [currentRange, setCurrentRange] = useState<{ start: string; end: string } | null>(null)

  // ✅ ทำเป็น useMemo เพื่อไม่ให้ ESLint ฟ้องเรื่อง dependency
  const calendarSources = useMemo(
    () => [
      {
        id: "habumtvugs9np0paofk1bl3mq4pgkktq@import.calendar.google.com",
        color: "#ff7043",
        name: "วันหยุด",
      },
      {
        id: "c_9ccfcdc7c335f7167d53ff903c5f494149fb4efcf6d0f00c487eae2e18709d6f@group.calendar.google.com",
        color: "#3b82f6",
        name: "วิชาการ",
      },
      {
        id: "c_d000b109245aefcc4e546c3fe187e53901165f903286014a87a112deedd62297@group.calendar.google.com",
        color: "#33b679",
        name: "วัดผล",
      },
      {
        id: "c_dbc8b5781d9c0d63b61c9f6e9ad733bbbd668625769b9daca09ce86bdb7842cb@group.calendar.google.com",
        color: "#FDBD00",
        name: "บุคคลากร",
      },
      {
        id: "c_cc65f71352bd822fd10c098c92e8f4363d8bb3d196d386a17bf62ced0d509c45@group.calendar.google.com",
        color: "#bc89db",
        name: "รับนักเรียน",
      },
    ],
    []
  )

  const apiKey = "AIzaSyCOReBMtCM1i9Cqy_oEJa0WMBxmwC38TYk"

  useEffect(() => {
    const fetchAllEvents = async () => {
      const allEvents: Event[] = []

      await Promise.all(
        calendarSources.map(async (calendar) => {
          const res = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendar.id}/events?key=${apiKey}`
          )
          const data = await res.json()

          // ✅ กำหนด type ของ data.items
          const parsed: Event[] = (data.items as GoogleCalendarEvent[]).map((e) => {
            const startDate = e.start?.date || e.start?.dateTime || ""
            const endDate = e.end?.date || e.end?.dateTime

            function toDate(d: string) {
              return d.includes("T") ? new Date(d) : new Date(`${d}T00:00:00`)
            }

            let adjustedEndDate: string | null | undefined = endDate

            if (startDate && endDate) {
              const start = toDate(startDate)
              const end = toDate(endDate)
              const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
              if (diffInDays === 1) adjustedEndDate = null
            }

            return {
              id: e.id,
              title: e.summary ?? "(ไม่มีชื่อกิจกรรม)",
              start: startDate, // ✅ เป็น string เสมอ
              end: adjustedEndDate ?? undefined,
              calendarId: calendar.id,
              calendarName: calendar.name,
              color: calendar.color,
            }
          })

          allEvents.push(...parsed)
        })
      )

      setEvents(allEvents)
    }

    fetchAllEvents()
  }, [calendarSources]) // ✅ dependency ครบ

  // ✅ ฟังก์ชันกรองช่วงวันที่เลือกใน calendar
  useEffect(() => {
    const compareStart = (a: Event, b: Event) =>
      new Date(a.start).getTime() - new Date(b.start).getTime()

    if (currentRange) {
      const filtered = events
        .filter((event) => {
          const eventDate = new Date(event.start)
          const start = new Date(currentRange.start)
          const end = new Date(currentRange.end)
          return eventDate >= start && eventDate < end
        })
        .sort(compareStart)
      setVisibleEvents(filtered)
    } else {
      setVisibleEvents([...events].sort(compareStart))
    }
  }, [currentRange, events])

  return (
    <div className="2xl:flex 2xl:space-x-6">
      {/* 🔹 ปฏิทิน */}
      <div className="2xl:w-2/4 w-full mb-6 2xl:mb-0">
        <Card>
          <CardContent>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventColor="var(--primary)"
              eventDisplay="block"
              datesSet={(arg) => {
                setCurrentRange({ start: arg.startStr, end: arg.endStr })
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek,dayGridDay",
              }}
              buttonText={{
                today: "วันนี้",
                month: "เดือน",
                week: "สัปดาห์",
                day: "วัน",
              }}
              eventContent={(arg) => (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="truncate cursor-pointer px-1">
                        {arg.event.title}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{arg.event.title}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* 🔹 ตารางกิจกรรม */}
      <div className="2xl:w-2/4 w-full">
        <Card>
          <CardContent>
            <h2 className="text-xl font-medium mb-4">รายการกิจกรรม</h2>
            <FullTable data={visibleEvents} rowHeight="h-10" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
