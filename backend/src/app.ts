import express from "express";
import ndjson from "ndjson";
import { PromptRole } from "./types/prompt";
import { Repo } from "./db/repo";
import { LLMFactory } from "./llms/factory";
import { LLMEnum } from "./types/llm";
import { CHATGPT_DEFAULT_VERSION, CHATGPT_VERSIONS } from "./llms/chat-gpt";
import { GEMINI_DEFAULT_VERSION, GEMINI_VERSIONS } from "./llms/gemini";
import { LLAMA_DEFAULT_VERSION, LLAMA_VERSIONS } from "./llms/llama";
import { CLAUDE_DEFAULT_VERSION, CLAUDE_VERSIONS } from "./llms/claude";
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 6765;
// Use CORS middleware
app.use(cors());
app.use(express.json());

const llmFactory = new LLMFactory();

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Deprecated
app.get("/ask", async (req, res) => {
    const prompt = req.query.prompt;
    const llm = req.query.llm;

    if (!prompt || !llm) {
        return res.status(400).json({ error: "Prompt and LLM are required" });
    }

    let llmInstance = llmFactory.createLLM(llm);

    try {
        const response = await llmInstance.ask({
            role: PromptRole.USER,
            message: prompt,
        });
        res.json({ response: response.response });
    } catch (error) {
        res.status(500).json({ error: "Failed to get response from LLM" });
    }
});

// Deprecated
app.get("/ask-stream", async (req, res) => {
    const prompt = req.query.prompt;
    const llm = req.query.llm;

    if (!prompt || !llm) {
        return res.status(400).json({ error: "Prompt and LLM are required" });
    }

    let llmInstance = llmFactory.createLLM(llm);
    const streamResponse = llmInstance.askStream({
        role: PromptRole.USER,
        message: prompt,
    });

    // Create the NDJSON stream
    const stream = ndjson.stringify();

    // Pipe the stream to the response immediately
    stream.pipe(res);

    for await (const response of streamResponse) {
        stream.write(response);
    }

    res.end();
});

app.post(
    "/chat",
    asyncHandler(async (req, res) => {
        const llm = req.body.llm;
        const llmVersion = req.body.llmVersion;
        const chatID = req.body.chatID;
        const prompt = req.body.prompt;

        const llmInstance = llmFactory.createLLM(llm, llmVersion);

        const streamResponse = llmInstance.chatStream(
            {
                message: prompt,
                role: PromptRole.USER,
            },
            chatID,
        );

        const stream = ndjson.stringify();
        stream.pipe(res);
        for await (const response of streamResponse) {
            stream.write(response);
        }

        res.end();
    }),
);

app.post(
    "/message/like",
    asyncHandler(async (req, res) => {
        const messageID = req.query.messageID;
        const repo = new Repo();
        await repo.likeMessage(messageID);
        res.json({ success: true });
    }),
);

app.post(
    "/message/dislike",
    asyncHandler(async (req, res) => {
        const messageID = req.query.messageID;
        const repo = new Repo();
        await repo.dislikeMessage(messageID);
        res.json({ success: true });
    }),
);

app.get("/models", async (req, res) => {
    const models = [
        {
            name: LLMEnum.CHATGPT,
            displayName: "ChatGPT",
            versions: CHATGPT_VERSIONS,
            defaultVersion: CHATGPT_DEFAULT_VERSION,
            isSelectedByDefault: true,
        },
        {
            name: LLMEnum.GEMINI,
            displayName: "Gemini",
            versions: GEMINI_VERSIONS,
            defaultVersion: GEMINI_DEFAULT_VERSION,
            isSelectedByDefault: true,
        },
        {
            name: LLMEnum.LLAMA,
            displayName: "Llama",
            versions: LLAMA_VERSIONS,
            defaultVersion: LLAMA_DEFAULT_VERSION,
            isSelectedByDefault: true,
        },
        {
            name: LLMEnum.CLAUDE,
            displayName: "Claude",
            versions: CLAUDE_VERSIONS,
            defaultVersion: CLAUDE_DEFAULT_VERSION,
            isSelectedByDefault: true,
        },
    ];

    res.json({ models });

    res.end();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    // verify DB connection
    const repo = new Repo();
    repo.checkConnection();
});
