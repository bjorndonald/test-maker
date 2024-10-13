import { OpenAIEmbeddings } from "@langchain/openai";

// export const embeddings = new HuggingFaceInferenceEmbeddings({
//     model: "Xenova/all-MiniLM-L6-v2",
//     apiKey: process.env.HUGGING_FACE_API,
// })

export const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
})