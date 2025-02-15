import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export const loadAndSplitTheDocs = async (file_name) => {
  // load the uploaded file data
const file_path = file_name.map((name) => `d:/Project/chatapp/react-chat-websocket/server/uploads/${name}`);
const allSplits = [];
for (const path of file_path) {
    const loader = new PDFLoader(path);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 0,
    });
    const splits = await textSplitter.splitDocuments(docs);
    allSplits.push(...splits);
}
  return allSplits;
};

export const vectorSaveAndSearch = async (splits,question) => {
    const embeddings = new OllamaEmbeddings();
    const vectorStore = await MemoryVectorStore.fromDocuments(
        splits,
        embeddings
    );

    const searches = await vectorStore.similaritySearch(question);
    return searches;
};