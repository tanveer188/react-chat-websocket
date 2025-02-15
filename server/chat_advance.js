import { Ollama, OllamaEmbeddings } from "@langchain/ollama";

//stream
import "dotenv/config"
import { loadAndSplitTheDocs, vectorSaveAndSearch } from "./ai/utils/ai.js";

import { DataAPIClient } from "@datastax/astra-db-ts";
import { count } from "console";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN } = process.env

const { OLLAMA_MODEL, OLLAMA_EMBEDDING_MODEL, OLLAMA_URL } = process.env
const ollama = new Ollama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_URL
})

const embeddings = new OllamaEmbeddings({
    model: OLLAMA_EMBEDDING_MODEL,
    baseUrl: OLLAMA_URL
})

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

export async function* generateTextStream(file_names, messageList, latestMessage) {
    console.log("generateTextStream", file_names, messageList, latestMessage)
    try {

        let docContext = ""

        //embedding
        const embedding = await embeddings.embedQuery(latestMessage);

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding
                },
                limit: 10
            });

            const document = await cursor.toArray()

            const docMap = document?.map(doc => doc.text)

            docContext = JSON.stringify(docMap)

        } catch (err) {
            console.log("db error . . . . . . .\n", err)
            docContext = ""
        }
        const splits = await loadAndSplitTheDocs(file_names);
        // const searches = await vectorSaveAndSearch(splits, latestMessage);

        let context = "";
        splits.forEach((sp) => {
            // console.log("sp", sp.pageContent)
            context = context + "\n\n" + sp.pageContent;
        });

        const messages = messageList.map(msg => `${msg.user}: ${msg.message}`).join("\n");
        const template = `You are an AI mental health advisor.the sample conversation data provided.
        If the answer is not in the provided data do not answer the question."
        previous messages:
        ${messages}
        pdf context:
        ${context}
        reply like this data:
        ${docContext}
        Question: 
        ${latestMessage}`
        console.log("template", template)

        const stream = await ollama.stream(template);

        const chunks = [];
        let isThink = false;
        for await (const chunk of stream) {
            if (isThink) {
                chunks.push(chunk);
                yield chunk;
            } else if (chunk.includes("</think>")) {
                isThink = true;
            }
            process.stdout.write(chunk);
        }

    } catch (err) {
        console.log("Error ...........................", err)
    }
}

// Call the function with sample arguments

// const file_names = []
// const messageList = [{
//     user: "what is ai",
//     message: "ai stand for artificial intelligence"
// }]
// const latestMessage = `write c programm to print star pattern like
// *
// **
// ***
// ****
// *****`

// generateTextStream(file_names, messageList, latestMessage);

