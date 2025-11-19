"use client"
import { useState } from "react"
import Image from "next/image"

interface StudentImageProps {
  sID: string
  fullname: string
  size?: number
  className?: string
}

export function StudentImage({
  sID,
  fullname,
  size = 60,
  className = "",
}: StudentImageProps) {
  const [error, setError] = useState(false)

  // 🔹 ถ้า error ให้ใช้ fallback ทันที
  const src = error
    ? "/img/student/00000.png"
    : `/img/student/${sID}.jpg`

  return (
    <Image
      key={src} // ให้ re-render เมื่อ src เปลี่ยน
      src={src}
      alt={fullname}
      width={size}
      height={size}
      className={`object-cover rounded-full border border-gray-300 dark:border-gray-600 ${className}`}
      onError={() => setError(true)} // ✅ เมื่อโหลดไม่ได้
    />
  )
}
