import { Collection, DataAPIClient, Db, VectorDoc } from "@datastax/astra-db-ts";
import { embeddings } from "@/lib/embedding";
import { Document } from "langchain/document";
import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers";
import { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

interface Project extends VectorDoc {
    text: string,
    doc: string
}

export interface CustomRetrieverInput extends BaseRetrieverInput { }

export class CustomRetriever extends BaseRetriever {
    lc_namespace = ["tunikov2"];
    private collection: Collection<Project>

    constructor(collection:Collection<Project>, fields?: CustomRetrieverInput) {
        super(fields);
        this.collection = collection
    }

    async _getRelevantDocuments(
        query: string,
        runManager?: CallbackManagerForRetrieverRun
    ): Promise<Document[]> {
        const cursor = await this.collection?.find({}, {
            sort: { $vectorize: query },
            limit: 50,
            includeSimilarity: true,
        });
        const documents: Document[] =[]

        for await (const doc of cursor) {
            documents.push(new Document({
                pageContent: doc.text,
                metadata: {},
            }),)
        }

        return documents;
    }
}

export default class AstraService {
    private collection: Collection<Project>

    static from = async (id: string) => {
        const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
        const dbClient = client.db(process.env.ASTRA_DB_ENDPOINT!);
        dbClient.listCollections({nameOnly: true})

        const collection = await dbClient.collection<Project>(`documents${id.replaceAll("-", "")}`, {
                keyspace: "tunikov2"
            })
       
        return new AstraService(collection)
    }

    constructor(collection: Collection<Project>) { 
        this.collection = collection
    }

    addDocuments = async (docs: Document<Record<string, any>>[], doc: string) => {
        try {
            const vectors = await embeddings.embedDocuments(docs.map(x => x.pageContent))
            const documents = vectors.map((x, i)=> {
                return {
                    text: docs[i].pageContent,
                    doc,
                }
            })

            const inserted = await this.collection?.insertMany(documents);
            return inserted
        } catch (error) {
            throw error
        }
    }

    getRetriever = async () => {
        const retriever = new CustomRetriever(this.collection!)
        return retriever
    }

    getDocRetriever = async (doc: string, project: string) => {
        const cursor = await this.collection?.find({
            $and: [
                { doc: doc, project: project }
            ]
        }, {
            limit: 50
        });

        const texts: {text: string, id: string}[] = []

        for await (const doc of cursor) {
            texts.push({
                text:doc.text,
                id: doc._id as string
            })
        }

        return texts
    }

    deleteDoc = async (doc: string) => {
        await this.collection.deleteMany({ doc });
    }

}