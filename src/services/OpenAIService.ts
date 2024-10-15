import { RESPONSE_ANSWER_SYSTEM_TEMPLATE, RESPONSE_TAGS_SYSTEM_TEMPLATE } from "@/constants/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

export default class OpenAIService {
    private openAIllm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY
        // other params...
    });

    accessAnswer = async (answer: string, correctAnswer: string) => {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", RESPONSE_ANSWER_SYSTEM_TEMPLATE],
            ["user", "This is the teacher's correct answer: {correctAnswer} and this is the student's answer {answer}"],
        ]);

        const parser = StructuredOutputParser.fromZodSchema(z.object({
            answer: z.object({
                correct: z.boolean(),
                correctness: z.number(),
            })
        }))

        const chain = prompt.pipe(this.openAIllm);
        const aiMsg = await chain.invoke({
            answer,
            correctAnswer,
            format_instructions: parser.getFormatInstructions(),
        });
        
        return aiMsg.content.toString().replaceAll("```json", "").replaceAll("```", "")
    }

    generateTags = async (text: string) => {
        const aiMsg = await this.openAIllm.invoke([
            [
                "system",
                RESPONSE_TAGS_SYSTEM_TEMPLATE,
            ],
            ["human", text],
        ]);

        return aiMsg.content.toString()
    }
}