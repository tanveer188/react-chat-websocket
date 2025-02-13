import { Ollama, OllamaEmbeddings } from "@langchain/ollama";

//stream
import "dotenv/config"

import { DataAPIClient } from "@datastax/astra-db-ts";

const { ASTRA_DB_NAMESPACE,ASTRA_DB_COLLECTION,ASTRA_DB_API_ENDPOINT,ASTRA_DB_APPLICATION_TOKEN} = process.env

const ollama = new Ollama({
    model:"deepseek-r1:1.5b",
    baseUrl:"http://localhost:11434"
})

const embeddings = new OllamaEmbeddings({
    model:"mxbai-embed-large:latest",
    baseUrl:"http://localhost:11434"
})


const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
// if (!ASTRA_DB_API_ENDPOINT) {
//     console.error("ASTRA_DB_API_ENDPOINT is not defined");
// } else {
//     const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });
// }
const db = client.db(ASTRA_DB_API_ENDPOINT,{namespace:ASTRA_DB_NAMESPACE})
export async function POST(req){
    try {
        const {messages} = await req.json()
        const latestMessage = messages[messages?.length - 1]?.content

        let docContext = ""

        //embedding
        const embedding = await embeddings.embedQuery(latestMessage);

        try{
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null,{
                sort:{
                    $vector:embedding
                },
                limit:10
            });

            const document = await cursor.toArray()

            const docMap = document?.map(doc=>doc.text)

            docContext = JSON.stringify(docMap)

        }catch(err){
            console.log("db errror . . . . . . .\n",err)
            docContext = ""
        }

        // const template = {
        //     role : "systum",
        //     content :`
        //     you are a ai history ai answer the question enclosed in ?
            
        //     some data about it is ${docContext} 
        //     ??????????????????????????????
        //     question : ${latestMessage}
        //     ????????????????????????????`
        // }
        const template = `You are an AI history assistant. Answer the question enclosed in "?" based only on the data provided.
Data is encolsed in \
If the answer is not in the provided data, respond with "The answer is not in my knowledge."
//////////////////////////////
${docContext}
//////////////////////////////
??????????????????????????????
Question: ${latestMessage}
????????????????????????????`
        console.log("template",template)

        const stream = await ollama.stream(template);
          
        const chunks = [];
        for await (const chunk of stream) {
            process.stdout.write(chunk);
            chunks.push(chunk);
        }
          

    } catch (err) {
        console.log("Error ...........................",err)
    }
}

// Call the function with sample arguments
const sampleRequest = {
    json: async () => ({
        messages: [{ content: "Who is the future of humanity" }]
    })
};

POST(sampleRequest);

