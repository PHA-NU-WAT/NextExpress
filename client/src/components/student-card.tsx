"use client"

import Image from "next/image"
import { useState } from "react"

export type StudentInfo = {
  sID: string
  fullname: string
  sPIN: string
  dob: string
}

type StudentCardProps = {
  student: StudentInfo
}

export function StudentCard({ student }: StudentCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [photoSrc, setPhotoSrc] = useState(`/img/student/${student.sID}.jpg`)
  const name = student.fullname.replace("เด็กชาย", "")

  return (
    <div
      className="w-[320px] h-[500px] perspective cursor-pointer group"
      onClick={() => setFlipped(!flipped)} // tap toggle
    >
      {/* card-inner */}
      <div
        className={`relative w-full h-full transition-transform duration-[1500ms] ease-out preserve-3d ${
          flipped ? "rotate-y-180" : ""
        } group-hover:rotate-y-180`}
      >
        {/* --------- ด้านหน้า --------- */}
        <div className="absolute inset-0 backface-hidden rounded-lg shadow-xl overflow-hidden">
          <Image
            src="/img/card/cardStudent1.png"
            alt="front card"
            fill
            unoptimized
            className="object-cover"
          />

          {/* overlay: ข้อมูลนักเรียน */}
          <div className="absolute top-[120px] left-[20px] text-sm text-black w-[90%]">
            <div>
              <Image
                src={photoSrc}
                alt={student.fullname}
                width={115}
                height={153}
                className="absolute bottom-[-130px] right-0 w-[115px] h-[153px] object-cover rounded-sm"
                onError={() => setPhotoSrc("/img/student/00000.png")}
                unoptimized
              />
              <div className="pt-[73px] w-full">
                <p className="font-bold text-[25px]">{name}</p>
                <p className="font-bold text-[20px] pt-[25px]">{student.sPIN}</p>
                <p className="font-bold text-[20px] pt-[20px]">{student.dob}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --------- ด้านหลัง --------- */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-xl overflow-hidden">
          <Image
            src="/img/card/cardStudent2.png"
            alt="back card"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}
