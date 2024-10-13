import { OPENAI_MODEL } from "@/constants";
import { getChatModel } from "@/lib/chatModel";
import { NextRequest, NextResponse } from "next/server";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RESPONSE_SYSTEM_TEMPLATE } from "@/constants/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import AstraService from "@/services/AstraService";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { BaseRetrieverInterface } from "@langchain/core/retrievers";
import AstraDBService from "@/services/AstraDBService";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";

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

    // const retriever = await dbService.getRetriever()
    // const results = await retriever.invoke("people")
    // console.log(results)

    const retrievalChain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever: historyAwareRetrieverChain,
    });

    const fullChain = retrievalChain.pick("answer");

    const response = await fullChain.invoke(
        {
            input: `people`,
            chat_history: [],
            format_instructions: parser.getFormatInstructions(),
        });
    console.log(response)
    //     const questions = JSON.parse(response.replaceAll("```","").replaceAll("json", ""))
    // console.log(questions)
}

export const POST = async (req: NextRequest) => {
    const { id,  numOfQuestions } = await req.json()

    try {
        const response = await generateRAGResponse(id, numOfQuestions)

        return NextResponse.json({}, { status: 200 })
    } catch (error) {
      console.log(error)
        return NextResponse.json(error, { status: 500 })
    }
}