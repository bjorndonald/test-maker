"use client";
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {Button} from "@/components/atoms/button"
import { Progress } from "@/components/atoms/progress"
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react'
import axios from 'axios'
import useAppStore from '@/store';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

const UploadPdf = () => {
    const params = useParams()
    const reset = useAppStore(s => s.reset)
    const selectPDF = useAppStore(s => s.selectPDF)
    const selectedPDF = useAppStore(s => s.selectedPdf)
    const updatePDFInfo = useAppStore(s => s.updatePDFInfo)
    const [embedding, setEmbedding] = useState(false)
    const currentId = useAppStore(s => s.currentId)
    const [analyzing, setAnalyzing] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadError, setUploadError] = useState<string | null>(null)
    // const [selectedPDF, setSelectedPDF] = useState<File | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file && file.type === 'application/pdf') {
            selectPDF(file)
            setUploadError(null)
            // Simulate upload progress
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                setUploadProgress(progress)
                if (progress >= 100) {
                    clearInterval(interval)
                }
            }, 200)
        } else {
            setUploadError('Please upload a valid PDF file.')
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    })

    async function analyzePDF() {
        try {
            if (analyzing) return
            if (selectedPDF === null) {
                toast.error(`You must select a file to analyze.`);
                return;
            }
            setUploadError('')
            setAnalyzing(true);
            // setLoading(true)
            const formData = new FormData()
            formData.append("file", selectedPDF)
            const res = await axios.post("/api/analyze", formData)
            
            toast.success("Upload finished")
            updatePDFInfo(res.data.id, res.data.numberOfPages, res.data.pdfs)
            setAnalyzing(false)
            // selectDocument(res.data.doc)
            // toast(`Embedding finished`, {
            //     theme: "dark",
            // });
            // handleClose()
        } catch (error) {
            setAnalyzing(false)
            toast.error(`Embedding error`);
            setUploadError('Embedding error')
        }
    }

    return (
        <div >
            <div className=" flex flex-col items-center gap-10 sm:max-w-[425px] bg-base-100">
                <div>
                    <h1 className='text-4xl'>Upload PDF</h1>
                </div>
                {!selectedPDF ? (
                    <div
                        {...getRootProps()}
                        className={`border-0.5 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            Drag & drop your PDF here, or click to select a file
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <span className="font-medium">{selectedPDF.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto"
                                    onClick={() => reset()}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove file</span>
                            </Button>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                        {uploadProgress === 100 && (
                            <div className="flex items-center text-green-600">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                <span>Upload complete!</span>
                            </div>
                        )}
                    </div>
                )}
                {uploadError && (
                    <div className="flex items-center text-red-600 mt-2">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span>{uploadError}</span>
                    </div>
                )}
                <div className="flex justify-end space-x-2">
                    {!!selectedPDF && !currentId && <Button onClick={analyzePDF} disabled={!selectedPDF || uploadProgress < 100}>
                        {uploadProgress < 100 ? 'Uploading...' : analyzing ? "Analyzing..." : "Analyze"}
                    </Button>}
                    
                </div>
            </div>
        </div>
    )
}

export default UploadPdf