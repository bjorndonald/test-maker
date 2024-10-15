"use client";
import useAppStore from '@/store';
import React, { useEffect, useMemo, useState } from 'react'
import PDFDocument from './PDFDocument';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Button } from '@/components/atoms/button';
import { AlertCircle } from 'lucide-react';
import Pagination from '@/components/organism/pagination';

const DisplayPages = () => {
    const numberOfPages = useAppStore(s => s.numberOfPages)
    const allowGenerate = useAppStore(s => s.allowGenerate)
    const start = useAppStore(s => s.start)
    const stop = useAppStore(s => s.stop)
    const setStart = useAppStore(s => s.setStart)
    const setStop = useAppStore(s => s.setStop)
    const currentId = useAppStore(s => s.currentId)
    const selectedPdf = useAppStore(s => s.selectedPdf)
    const pdfs = useAppStore(s => s.pdfs)
    const updateEmbedInfo = useAppStore(s => s.updateEmbedInfo)
    const [embedding, setEmbedding] = useState(false)
    const [uploadError, setUploadError] = useState("")
    const [page, setPage] = useState(1)

    async function embedPDF() {
        try {
            console.log(start, stop)
            if (embedding) return
            if(!start || !stop) return 
            if (selectedPdf === null) {
                toast.error(`You must select a file to analyze.`);
                return;
            }

            setUploadError('')
            setEmbedding(true);
            // setLoading(true)
            const formData = new FormData()
            formData.append("file", selectedPdf)
            
            formData.append("start", start+"")
            formData.append("stop", stop+"")
            formData.append("id", currentId)
            const res = await axios.post("/api/embed", formData)
            allowGenerate()
            updateEmbedInfo(res.data.tags)
            toast.success("Embedding finished")
            setEmbedding(false)
            // selectDocument(res.data.doc)
            // toast(`Embedding finished`, {
            //     theme: "dark",
            // });
            // handleClose()
        } catch (error) {
            setEmbedding(false)
            toast.error(`Embedding error`);
            setUploadError('Embedding error')
        }
    }

    const currentTableData = useMemo(() => {
        const firstPageIndex = (page - 1) * 6;
        const lastPageIndex = firstPageIndex + 6;
        return pdfs?.slice(firstPageIndex, lastPageIndex);
    }, [page, pdfs]);

    return !!currentId && (
        <div className='flex flex-col items-center'>
            <h1 className='text-4xl mb-3'>Pages of Document</h1>

            <div className="flex gap-3 mb-6 items-center justify-center">
                <input value={start} onChange={e => setStart(+e.target.value)} className='w-12 border outline-none ring-0 border-base-300' type="number" />
                <span>to</span>
                <input value={stop} onChange={e => setStop(+e.target.value)} className='w-12 border outline-none ring-0 border-base-300' type="number" />
                <span>in {numberOfPages} pages</span>
            </div>

            <div className="flex flex-wrap justify-center mb-6 gap-7 max-w-5xl mx-auto px-4">
                {currentTableData.map((x, i) => (
                    <PDFDocument sid={6 * (page-1) + i+1} pdfString={x} key={i} />
                ))} 
            </div>
            <div className='mb-6'>
                <Pagination totalCount={numberOfPages} pageSize={6} currentPage={page} onPageChange={setPage} />
            </div>
            
            {uploadError && (
                <div className="flex items-center text-red-600 mb-2">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span>{uploadError}</span>
                </div>
            )}
            {!!currentId && <Button onClick={embedPDF}>
                {embedding ? "Embedding..." : "Embed"}
            </Button>}
        </div>
    )
}

export default DisplayPages