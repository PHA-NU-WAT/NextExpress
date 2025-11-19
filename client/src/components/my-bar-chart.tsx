"use client"

import { memo, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
  ChartConfig,
} from "@/components/ui/chart"

// 🔹 ระบุ type ของข้อมูลให้ชัดเจน (ไม่ใช้ any)
type ChartDatum = Record<string, number | string | undefined>

interface MyBarChartProps {
  title?: string
  data: ChartDatum[]
  config: ChartConfig
}

// ✅ เปลี่ยนชื่อให้เป็น component จริง (ไม่มี "_")
function MyBarChartBase({ data, config }: MyBarChartProps) {
  const keys = Object.keys(config)

  // ✅ ใช้ useMemo อย่างถูกต้อง
  const { roundedMax, ticks } = useMemo(() => {
    const max = Math.max(...data.flatMap(d => keys.map(k => Number(d[k] ?? 0))))
    const roundedMax = Math.ceil(max / 50) * 50
    const ticks = Array.from({ length: roundedMax / 50 + 1 }, (_, i) => i * 50)
    return { roundedMax, ticks }
  }, [data, keys])

  return (
    <ChartContainer config={config} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <XAxis
          dataKey="room"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.toString().slice(0, 3)}
        />
        <YAxis
          domain={[0, roundedMax]}
          ticks={ticks}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value} คน`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <CartesianGrid vertical={false} />
        {keys.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            fill={config[key].color}
            radius={4}
            isAnimationActive
            animationDuration={800}
            animationBegin={idx * 200}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

// ✅ memo ใช้กับ component ที่ชื่อขึ้นต้นด้วยตัวใหญ่
export const MyBarChart = memo(MyBarChartBase)
