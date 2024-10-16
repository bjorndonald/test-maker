import { OPENAI_MODEL } from "@/constants";
import { getChatModel } from "@/lib/chatModel";
import { NextRequest, NextResponse } from "next/server";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RESPONSE_SYSTEM_TEMPLATE } from "@/constants/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import AstraService from "@/services/AstraService";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { z } from "zod";

async function generateRAGResponse(id: string, tags: string[], numOfQuestions: number) {
    const chatModel = getChatModel(OPENAI_MODEL)
    const dbService = await AstraService.from(id)
    
    
    // const parser = StructuredOutputParser.fromNamesAndDescriptions({
    //     question: "generated question",
    //     answer: "correct answer to the question",
    // });
    const schema = z.object({
        questions: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        }))
    })
    type Res = z.infer<typeof schema>
    const parser = StructuredOutputParser.fromZodSchema(schema)
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            RESPONSE_SYSTEM_TEMPLATE + `\nPlease generate ${numOfQuestions} questions`,
        ],
        ["placeholder", "{chat_history}"],
        ["user", `{input}`],
    ]);

    const documentChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: prompt,
        documentPrompt: PromptTemplate.fromTemplate(
            `<doc>\n{page_content}\n</doc>`,
        ),
    });

    let historyAwarePrompt = PromptTemplate.fromTemplate(`{chat_history}
        Rephrase the following question into a standalone, natural language query with important keywords that a researcher could later pass into a search engine to get information relevant to the conversation. Do not respond with anything except the query.\n\n<question_to_rephrase>\n{input}\n</question_to_rephrase>`);
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: chatModel,
        retriever: await dbService.getRetriever(),
        rephrasePrompt: historyAwarePrompt,
    });

    const retrievalChain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever: historyAwareRetrieverChain,
    });

    const fullChain = retrievalChain.pick("answer");

    const response = await fullChain.invoke(
        {
            input: `Please give me questions on these subjects from the provided context ${tags.reduce((a,b)=> a+", "+b, "")}`,
            chat_history: [],
            format_instructions: parser.getFormatInstructions(),
        });
    console.log(response)
    const formattedRes = response.replaceAll("```json", "").replaceAll("```", "")
        // const questions = JSON.parse(response.replaceAll("```","").replaceAll("json", ""))
    console.log(formattedRes)
    const responseObj = JSON.parse(formattedRes) as Res
    console.log(responseObj)
    return responseObj.questions
}

export const POST = async (req: NextRequest) => {
    const { id, tags, numOfQuestions } = await req.json()

    try {
        const results = await generateRAGResponse(id, tags, numOfQuestions)

        return NextResponse.json({ results }, { status: 200 })
    } catch (error) {
        console.log(error)
       return NextResponse.json(error, { status: 500 })
    }
}