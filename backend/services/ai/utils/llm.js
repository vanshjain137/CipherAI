import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
dotenv.config();

const llm = new ChatOpenRouter({
  model: "openrouter/free",
  temperature: 0,
  maxTokens: 8192,
  maxRetries: 0,
  apiKey: process.env.OPENROUTER_API_KEY
});

export default llm;