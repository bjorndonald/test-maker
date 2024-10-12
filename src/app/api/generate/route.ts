import { OPENAI_MODEL } from "@/constants";
import { getChatModel } from "@/lib/chatModel";
import { NextRequest, NextResponse } from "next/server";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RESPONSE_SYSTEM_TEMPLATE } from "@/constants/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import AstraService from "@/services/AstraService";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

async function generateRAGResponse(id: string, numOfQuestions: number) {
    const chatModel = getChatModel(OPENAI_MODEL)
    const dbService = await AstraService.from(id)

    const parser = StructuredOutputParser.fromNamesAndDescriptions({
        question: "generated question",
        answer: "correct answer to the question",
    });
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            RESPONSE_SYSTEM_TEMPLATE,
        ],
        ["user", `Please generate this number of questions: {questions}`],
    ]);

    const documentChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: prompt,
        documentPrompt: PromptTemplate.fromTemplate(
            `<doc>\n{page_content}\n</doc>`,
        ),
    });

    const retrievalChain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever: await dbService.getRetriever(),
    });
    
    const fullChain = retrievalChain.pick("answer");

    const response = await fullChain.invoke(
        {
            questions: numOfQuestions,
            format_instructions: parser.getFormatInstructions(),
        });
    console.log(response)
}

export const POST = async (req: NextRequest) => {
    const { id,  numOfQuestions } = await req.json()

    try {
       
        const response = generateRAGResponse(id, numOfQuestions)

        return NextResponse.json({}, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(error, { status: 500 })
    }
}