import { NextResponse } from "next/server"
import { PDFDocument, rgb, degrees } from "pdf-lib"
import fontkit from "fontkit"
import fs from "fs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    // ✅ ดึงค่า query จาก URL
    const { searchParams } = new URL(req.url)
    const sClass = searchParams.get("sClass") || "-"
    const sRoom = searchParams.get("sRoom") || "-"

    // โหลด template PDF
    const templateBytes = fs.readFileSync("public/templates/landscapeList.pdf")

    // โหลดฟอนต์
    const fontRegularBytes = fs.readFileSync("public/fonts/THSarabunNew.ttf")
    const fontBoldBytes = fs.readFileSync("public/fonts/THSarabunNew Bold.ttf")

    // โหลด template document
    const templateDoc = await PDFDocument.load(templateBytes)

    // ✅ import เฉพาะหน้าแรก
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)
    const [firstPage] = await pdfDoc.copyPages(templateDoc, [0])
    pdfDoc.addPage(firstPage)

    // ฝังฟอนต์
    const fontRegular = await pdfDoc.embedFont(fontRegularBytes)
    const fontBold = await pdfDoc.embedFont(fontBoldBytes)

    const page = pdfDoc.getPages()[0]

    // ตัวอย่างข้อมูล
    const sNo = "05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052\n05052"
    // ใช้ฟอนต์ regular
    page.drawText(sNo, {
        x: 115,
        y: 60,
        size: 16,
        font: fontRegular,
        color: rgb(0, 0, 0),
        rotate: degrees(90),
        lineHeight: 18.8
    })

    // ✅ ใช้ค่าจาก query
    page.drawText(`รายชื่อนักเรียนชั้นมัธยมศึกษาปีที่ ${sClass} ห้อง ${sRoom}`, {
        x: 52,
        y: 80,
        size: 18,
        font: fontBold,
        color: rgb(0, 0, 0),
        rotate: degrees(90),
    })

    const pdfBytes = await pdfDoc.save()
    const buffer = Buffer.from(pdfBytes)

    const fileName = encodeURIComponent(`รายชื่อนักเรียน ม.${sClass}-${sRoom}.pdf`)
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"; filename*=UTF-8''${fileName}`,
        },
    })
}
