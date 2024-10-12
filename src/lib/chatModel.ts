import { CLAUDEAI_MODEL, OPENAI_MODEL } from "@/constants";
import { ChatOpenAI } from "@langchain/openai";

export const getChatModel = (model: string) => {
    if (model === OPENAI_MODEL)
        return new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            stop: ["\nInstruct:", "Instruct:", "<hr>", "\n<hr>"],
        });
    if (model === CLAUDEAI_MODEL)
        return new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            stop: ["\nInstruct:", "Instruct:", "<hr>", "\n<hr>"],
        });
    return new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        stop: ["\nInstruct:", "Instruct:", "<hr>", "\n<hr>"],
    });
}