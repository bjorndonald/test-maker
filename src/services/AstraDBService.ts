import { embeddings } from "@/lib/embedding";
import { AstraDBVectorStore, AstraLibArgs } from "@langchain/community/vectorstores/astradb";
import { Document } from "langchain/document";

export const astraConfig: AstraLibArgs = {
    token: process.env.ASTRA_DB_APPLICATION_TOKEN as string,
    endpoint: process.env.ASTRA_DB_ENDPOINT as string,
    collection: process.env.ASTRA_DB_COLLECTION ?? "langchain_test",
    namespace: "tunikov2",
    collectionOptions: { 
        checkExists: false,
        vector: {
            dimension: 1536,
            metric: "cosine",
            service: {
                provider: 'openai',
                modelName: 'text-embedding-3-small',
                authentication: {
                    providerKey: "OPEN_AI_KEY",
                },
            },
        },
    },
};

export default class AstraDBService {
    private store: AstraDBVectorStore
    constructor(store: AstraDBVectorStore) {
        this.store = store
    }

    static from = async (id: string) => {
        const collectionName = `documents${id.replaceAll("-", "")}`
        // const vectorStore = new AstraDBVectorStore(embeddings, {
        //     ...astraConfig,
        //     collection: collectionName,
        //     skipCollectionProvisioning: true
        // })
        const vectorStore = await AstraDBVectorStore.fromExistingIndex(
            embeddings, 
            {
                ...astraConfig,
                collection: collectionName
            }
        );
        return new AstraDBService(vectorStore)
    }

    addDocuments = async (docs: Document[]) => {
        try {
            await this.store.addDocuments(
                docs,
            );
        } catch (error) {
            throw error
        }
        // const inserted = await collection.insertMany(documents);
    }

    getRetriever = async () => {
        return this.store.asRetriever();
    }

    getDocRetriever = async (project: string) => {
        return this.store.similaritySearch("", 1, {
            page: 1
        });
    }

    deleteDoc = async (ids: string[]) => {
        return this.store.delete({
            ids
        });
    }
}