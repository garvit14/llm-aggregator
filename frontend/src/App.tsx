// src/App.tsx
import React, { useState } from "react";
import PromptInput from "./components/PromptInput";
import LLMResults from "./components/LLMResults";
import { Typography, Box } from "@mui/material";

// const readline = require('linebyline');

interface LLMResponse {
    llmName: string;
    result: string;
}

// const llms = ["chatgpt", "claude", "gemini", "llama"];
const llms = ["gemini", "llama"];

interface LLMState {
    llmName: string;
    llmResponse: string;
    setLLMResponse: (setter: (prev: string) => string) => void;
}

export interface ResponseState {
    // The key is the LLM name, and the value is the response text
    [key: string]: string;
}

const App: React.FC = () => {
    const initialState: ResponseState = {};
    for (const llm of llms) {
        initialState[llm] = "";
    }
    const [response, setResponse] = useState<ResponseState>(initialState);

    async function streamNDJSON(prompt: string, llm: string) {
        const url = `http://localhost:6765/ask-stream?llm=${llm}&prompt=${prompt}`;
        const response = await fetch(url);
        if (response.body === null) {
            console.error("Response body is null");
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let result;
        let ndjsonBuffer = "";

        while (!(result = await reader.read()).done) {
            const chunk = decoder.decode(result.value, { stream: true });

            // Add the chunk to the buffer
            ndjsonBuffer += chunk;

            // Process each complete line of NDJSON
            let lines = ndjsonBuffer.split("\n");
            ndjsonBuffer = lines.pop() as string; // Save incomplete line for later

            lines.forEach((line) => {
                if (line.trim()) {
                    try {
                        const jsonObject = JSON.parse(line);
                        console.log("Received Data:", jsonObject);
                        setResponse((prev) => ({
                            ...prev,
                            [llm]: prev[llm] + jsonObject.response,
                        }));
                    } catch (error) {
                        console.error("Error parsing JSON line: ", line, error);
                    }
                }
            });
        }

        console.log("stream done");
    }

    const handlePromptSubmit = async (prompt: string) => {
        setResponse(initialState);
        for (const llm of llms) {
            streamNDJSON(prompt, llm);
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box textAlign="center" mt={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    LLM Comparison Tool
                </Typography>
            </Box>

            <Box sx={{ maxWidth: "100%", padding: 2 }}>
                <PromptInput onSubmit={handlePromptSubmit} />
            </Box>

            <Box sx={{ maxWidth: "100%", padding: 2 }}>
                {Object.keys(response).length > 0 && (
                    <Box mt={4} sx={{ maxWidth: "100%" }}>
                        <LLMResults results={response} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default App;
