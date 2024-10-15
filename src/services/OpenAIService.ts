import { RESPONSE_TAGS_SYSTEM_TEMPLATE } from "@/constants/prompts";
import { ChatOpenAI } from "@langchain/openai";


export default class OpenAIService {
    private openAIllm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY
        // other params...
    });

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