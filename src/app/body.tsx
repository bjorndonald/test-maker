"use client";
import DisplayPages from '@/components/ui/display-pages';
import Generate from '@/components/ui/generate';
import UploadPdf from '@/components/ui/upload-pdf';
import useAppStore from '@/store';
import React from 'react'

const Body = () => {
    const canGenerate = useAppStore(s => s.canGenerate)
    const currentId = useAppStore(s => s.currentId)
  return (
    <>
          {!currentId && !canGenerate && <UploadPdf />}
          {!!currentId && !canGenerate && <DisplayPages />}
          {!!currentId && !!canGenerate && <Generate />}
    </>
   
  )
}

export default Body