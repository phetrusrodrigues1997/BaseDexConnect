import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // API routes for transaction handling
  app.post("/api/transactions", async (req, res) => {
    try {
      const transaction = insertTransactionSchema.parse(req.body);
      const result = await storage.createTransaction(transaction);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Get transaction history
  app.get("/api/transactions/:walletAddress", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByWallet(req.params.walletAddress);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get supported tokens
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  // Chat endpoint using free Hugging Face API
  app.post("/api/chat", async (req, res) => {
    try {
      const userMessage = req.body.message;

      const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `<s>[INST] You are a helpful trading assistant for a decentralized exchange on Base network. Help users understand trading concepts, token swaps, and provide general guidance about using the DEX. Do not provide financial advice or price predictions.

User: ${userMessage} [/INST]`,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7,
              top_p: 0.95,
              do_sample: true,
              return_full_text: false,
            },
          }),
        }
      );

      const data = await response.json();
      res.json({ message: data[0].generated_text.trim() });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "Failed to process chat request. Using free API which may have rate limits." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}