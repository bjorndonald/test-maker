import { OpenAIEmbeddings } from "@langchain/openai"
import { NextRequest, NextResponse } from "next/server"
import { Voy as VoyClient } from "voy-search";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { v4 as uuidv4 } from 'uuid';
import AstraService from "@/services/AstraService";
import fs from 'fs'
import { PDFDocument } from 'pdf-lib'
import { Document } from "langchain/document";

async function splitPdf(buffer: Buffer) {
    const pdfDoc = await PDFDocument.load(buffer)

    const numberOfPages = pdfDoc.getPages().length;

    for (let i = 0; i < numberOfPages; i++) {

        // Create a new "sub" document
        const subDocument = await PDFDocument.create();
        // copy the page at current index
        const [copiedPage] = await subDocument.copyPages(pdfDoc, [i])
        subDocument.addPage(copiedPage);
        const pdfBytes = await subDocument.save()
    }
}

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()
    const file = formData.get("file") as Blob
    const id = formData.get("id") as string
    const start = formData.get("start") as string
    const stop = formData.get("stop") as string
    const vectorDBService = await AstraService.from(id)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const pdfDoc = await PDFDocument.load(fileBuffer)
    const pdfs: Uint8Array[] = []
    const docs: Document<Record<string, any>>[] =[]
    for (let i = +start; i < +stop; i++) {
        const subDocument = await PDFDocument.create();
        const [copiedPage] = await subDocument.copyPages(pdfDoc, [i])
        subDocument.addPage(copiedPage);
        const pdfBytes = await subDocument.save()
        const pdfLoader = new WebPDFLoader(new Blob([pdfBytes]), {
            splitPages: true, parsedItemSeparator: " "
        });
        const pageDocs = await pdfLoader.load();
         docs.push(...pageDocs)
        pdfs.push(pdfBytes)
    }
    
    try {
        
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });
        const splitDocs = await splitter.splitDocuments(docs)
        await vectorDBService.addDocuments(splitDocs, id)

        return NextResponse.json({
        }, { status: 200 })
    } catch (error) {
        console.log(error)
         return NextResponse.json(error, { status: 500 })
    }
}