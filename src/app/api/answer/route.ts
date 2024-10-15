import OpenAIService from "@/services/OpenAIService"
import { NextRequest, NextResponse } from "next/server"


export const POST = async (req: NextRequest) => {
    const { answer, correctAnswer } = await req.json()
    const service = new OpenAIService()
    try {
        const answerRes = await service.accessAnswer(answer, correctAnswer)

        const answerObj = JSON.parse(answerRes) as {
            answer: {
                correctness: number
                correct: boolean
            }
        }

        return NextResponse.json({ mark: answerObj }, { status: 200 })
    } catch (error) {
       return NextResponse.json(error, { status: 500 })
    }
}