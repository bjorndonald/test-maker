import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from 'pdf-lib'

export const POST = async (req: NextRequest) => {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as Blob
        const id = uuidv4()
       
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const pdfDoc = await PDFDocument.load(fileBuffer)
        const numberOfPages = pdfDoc.getPages().length;
        // const blobs: Blob[] = []
        // const pdfs: Uint8Array[] = []
        const base64Arr: string[] = []
        for (let i = 0; i < numberOfPages; i++) {
            const subDocument = await PDFDocument.create();
            const [copiedPage] = await subDocument.copyPages(pdfDoc, [i])
            subDocument.addPage(copiedPage);
            const pdfBytes = await subDocument.save()
            const base64PDF = Buffer.from(pdfBytes as Uint8Array).toString('base64')
            // blobs.push(new Blob([pdfBytes]))
            // pdfs.push(pdfBytes)
            base64Arr.push(base64PDF)
        }
        return NextResponse.json({
            id, numberOfPages, pdfs: base64Arr
        }, { status: 200 })
    } catch(error) {
        return NextResponse.json(error, { status: 500 })
    }
}