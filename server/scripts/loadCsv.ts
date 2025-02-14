import { DataAPIClient } from "@datastax/astra-db-ts";
import { Ollama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";

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

const processCsv = async (filePath: string) => {
    const rows: { context: string, response: string }[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                rows.push({ context: row['Context'], response: row['Response'] });
            })
            .on('end', () => {
                resolve(rows);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const loadSampleData = async () => {
    try {
        const collection = await db.collection(ASTRA_DB_COLLECTION);
        const csvData = await processCsv('c:\\Users\\Tanveer\\Downloads\\amod.csv');
        for (const row of csvData) {
            const content = `Context: ${row.context}\nResponse: ${row.response}`;
            const chunks = splitter.splitText(content);
            for (const chunk of chunks) {
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

createCollection().then(() => loadSampleData());