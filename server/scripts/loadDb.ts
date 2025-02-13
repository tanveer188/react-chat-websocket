import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { Ollama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dotenv from "dotenv";

dotenv.config();

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";
const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPEN_AI_API_KEY } = process.env;

if (!ASTRA_DB_NAMESPACE || !ASTRA_DB_COLLECTION || !ASTRA_DB_API_ENDPOINT || !ASTRA_DB_APPLICATION_TOKEN) {
    throw new Error("Missing required environment variables.");
}

const llm = new Ollama({
    model: "deepseek-r1:1.5b",
});

const embedding = new OllamaEmbeddings({
    model: "mxbai-embed-large:latest",
    baseUrl: "http://localhost:11434",
});

const f1Data = [
    "https://en.wikipedia.org/wiki/Islamic_Golden_Age",
    "https://en.wikipedia.org/wiki/History_of_mathematics",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1024,
                metric: similarityMetric,
            },
        });
        console.log(res);
    } catch (error) {
        console.error("Error creating collection:", error);
    }
};

const loadSampleData = async () => {
    try {
        const collection = await db.collection(ASTRA_DB_COLLECTION);
        for await (const url of f1Data) {
            const content = await scrapePage(url);
            const chunks = splitter.splitText(content);
            for await (const chunk of await chunks) {
                console.log(chunk);
                const singleVector = await embedding.embedQuery(chunk);
                const vector = singleVector;
                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk,
                });
                console.log(res);
            }
        }
    } catch (error) {
        console.error("Error loading sample data:", error);
    }
};

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true,
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML);
            await browser.close();
            return result;
        },
    });
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

createCollection().then(() => loadSampleData());