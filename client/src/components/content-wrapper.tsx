"use client"

import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function ContentWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:p-8">
      <Card>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
