"use client"
import { useState } from "react"
import Image from "next/image"

interface TeacherImageProps {
  tPhoto: string
  fullname: string
  size?: number
  className?: string
}

export function TeacherImage({
  tPhoto,
  fullname,
  size = 60,
  className = "",
}: TeacherImageProps) {
  const [error, setError] = useState(false)

  const isValidUrl = (url?: string): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // ✅ ตัดสินใจเลือก src อย่างปลอดภัย
  const src =
    error || !tPhoto || !isValidUrl(tPhoto)
      ? "/img/student/00000.png"
      : tPhoto

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
