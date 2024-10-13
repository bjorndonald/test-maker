"use client";
import useAppStore from '@/store';
import React, { useEffect, useState } from 'react'
import {cx} from 'react-twc'

const PDFDocument = ({pdfString, sid}: {pdfString: string, sid: number}) => {
    const [pdfURL, setPdfURL] = useState("")
    const start = useAppStore(s => s.start)
    const stop = useAppStore(s => s.stop)
    const setStart = useAppStore(s => s.setStart)
    const setStop = useAppStore(s => s.setStop)

    const handleClick = () => {
        if(sid > stop && stop!==0){
            return
        }
        if(start === sid){
            setStart(0)
            return
        }
        if(stop === sid) {
            setStop(0)
            return
        }

        if(!!start){
            setStop(sid)
        } else {
            setStart(sid)
        }
    }

    useEffect(() => {
        if (!!pdfString) {
            const pdfBytes = new Uint8Array(atob(pdfString).split('').map(char => char.charCodeAt(0)));
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const pdfURL = URL.createObjectURL(pdfBlob);
            setPdfURL(pdfURL)
        }

        return () => {
        }
    }, [pdfString])
  return (
    <div className={cx(
        `relative w-[calc((100%/3)_-_56px)] cursor-pointer`
    )}>
          <div onClick={handleClick} className={cx(
              `p-4 rounded-1 absolute w-full h-full top-0 left-0 z-10`,
              start === sid && "border bg-blue-700/20 border-blue-400",
              stop === sid && "border bg-red-700/20 border-red-400"
          )}></div>
          {!!pdfURL && 
          <embed  src={pdfURL} style={{
              aspectRatio: 1.414
          }} className='w-full' height={"400"}  />}
    </div>
  )
}

export default PDFDocument