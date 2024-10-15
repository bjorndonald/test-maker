"use client";
import { Button } from '@/components/atoms/button';
import useAppStore from '@/store';
import axios from 'axios';
import { File } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { cx } from 'react-twc';
import $ from 'jquery'

interface Question {
  question: string
  answer: string
}

const Generate = () => {
  const canGenerate = useAppStore(s => s.canGenerate)
  const start = useAppStore(s => s.start)
  const stop = useAppStore(s => s.stop)
  const tags = useAppStore(s => s.tags)
  const disallowGenerate = useAppStore(s => s.disallowGenerate)
  const currentId = useAppStore(s => s.currentId)
  const [resetting, setResetting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [removedTags, setRemovedTags] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

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
        numOfQuestions: 10,
        tags: tags.filter(x => !removedTags.includes(x))
      })
      const questions = res.data.results as Question[]
      console.log(questions)
      setQuestions(questions)
      setGenerating(false)
      toast.success("Generation finished")
    } catch (error) {
      setGenerating(false)
      toast.error("Generating error")
    }
  }

  const submitAnswer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement); 
    $(".status").remove()

    const formValues = Object.fromEntries(formData.entries());
    questions.map(async (x, i) => {
      const value = formValues[i]
      const res = await axios.post("/api/answer", {
        answer: value,
        correctAnswer: x.answer
      })

      const mark = res.data.mark as {
        correctness: number,
        correct: boolean
      }

      console.log(mark)

      const questionElem = document.getElementById(`question${i}`) as HTMLDivElement
      var span = document.createElement("span")
      span.className = mark.correct ? "status text-green-600" : "status text-red-600"
      questionElem.append(span)

      span = document.createElement("span")
      span.textContent = mark.correctness+""
      questionElem.append(span)
    })
    return false
  }

  return !!canGenerate && (
    <div className="flex flex-col items-center">

      <div className="flex items-center text-blue-600 mb-6 mt-2">
        <File className="mr-2 h-4 w-4" />
        <span>{(stop+1) - start} pages have been embedded</span>
      </div>

      <div className="flex gap-3 mb-6 justify-center items-center flex-wrap">
        <h4 className='text-lg font-medium text-center'>Here is some subject matter devised from the selected pages. You can deselect the ones you dont want questions on. When done click generate</h4>
        {tags.map((x, i) => (
          <a onClick={() => {
            if(removedTags.includes(x)){
              setRemovedTags(removedTags.filter(el => el !== x))
            } else
            setRemovedTags([...removedTags, x])
          }} key={i} className={cx(
            "px-2 py-4 cursor-pointer transition-all rounded-2 border-blue-800",
            !removedTags.includes(x)&& "bg-blue-800 text-white",
            removedTags.includes(x) && "bg-blue-200 text-blue-800"
            )}>
            {x}
          </a>
        ))}
      </div>

      <div className="flex justify-end mb-6 gap-4">
        <Button onClick={reset}>
         {resetting ? "Resetting...": "Reset"}
        </Button>
        <Button onClick={generate}>
          {generating ? "Generating...": "Generate"}
        </Button>
      </div>
      {!!questions.length && <form id='questions-form' onSubmit={submitAnswer} className="flex px-4 max-w-5xl mx-auto items-center flex-col gap-10">
        <div className="flex flex-col gap-4">
          {questions.map((x, i) => (
            <div id={`question${i}`} key={i} className="flex flex-col gap-3">
              <label htmlFor={`${i}`}>
                {x.question}
              </label>
              <input placeholder='Answer here' className='input input-ghost' id={`${i}`} name={`${i}`} type="text" />
            </div>
          ))}
        </div>
        <Button type='submit'>
          Answer
        </Button>
      </form>}
       
    </div>
  )
}

export default Generate