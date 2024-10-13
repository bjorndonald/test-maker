"use client";
import { Button } from '@/components/atoms/button';
import useAppStore from '@/store';
import axios from 'axios';
import { File } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

const Generate = () => {
  const canGenerate = useAppStore(s => s.canGenerate)
  const start = useAppStore(s => s.start)
  const stop = useAppStore(s => s.stop)
  const disallowGenerate = useAppStore(s => s.disallowGenerate)
  const currentId = useAppStore(s => s.currentId)
  const [resetting, setResetting] = useState(false)
  const [generating, setGenerating] = useState(false)


  const reset = async () => {
    try {
      if(resetting) return
      setResetting(true)
      const res = await axios.post("/api/reset", {
        id: currentId,
      })
      
      setResetting(false)
      disallowGenerate()
      toast.success("Reset finished")
    } catch (error) {
      setResetting(false)
      toast.error("Reset error")
    }
  }

  const generate = async () => {
    try {
      if(!!generating) return
      setGenerating(true)
      const res = await axios.post("/api/generate", {
        id: currentId,
        numOfQuestions: 10
      })
      console.log(res.data)
      setGenerating(false)
      toast.success("Generation finished")
    } catch (error) {
      setGenerating(false)
      toast.error("Generating error")
    }
  }

  return !!canGenerate && (
    <div className="flex flex-col items-center">

      <div className="flex items-center text-blue-600 mb-6 mt-2">
        <File className="mr-2 h-4 w-4" />
        <span>{(stop+1) - start} pages have been embedded</span>
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={reset}>
         {resetting ? "Resetting...": "Reset"}
        </Button>
        <Button onClick={generate}>
          {generating ? "Generating...": "Generate"}
        </Button>
      </div>
      
    </div>
  )
}

export default Generate