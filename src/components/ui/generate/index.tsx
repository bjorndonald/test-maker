"use client";
import { Button } from '@/components/atoms/button';
import useAppStore from '@/store';
import axios from 'axios';
import React from 'react'
import toast from 'react-hot-toast';

const Generate = () => {
    const currentId =  useAppStore(s => s.currentId)

    const generate = async () => {
        try {
          const res = await axios.post("/api/generate", {
            id: currentId,
            numOfQuestions: 10
          })
          console.log(res.data)

          toast.success("Generation finished")
        } catch (error) {
            toast.error("Generating error")
        }
    }

  return !!currentId && (
    <Button onClick={generate}>
        Generate
    </Button>
  )
}

export default Generate