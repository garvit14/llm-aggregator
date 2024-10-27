// src/App.tsx
import React, { useState } from "react";
import PromptInput from "./components/PromptInput";
import { Typography, Box } from "@mui/material";
import { Chat } from "./components/Chat";
import Grid from "@mui/material/Grid2";

// const llms = ["chatgpt", "claude", "gemini", "llama"];
const llms = ["llama"];

const App: React.FC = () => {
    const [initialPrompt, setInitialPrompt] = useState<string>("");
    const handlePromptSubmit = async (prompt: string) => {
        setInitialPrompt(prompt);
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box textAlign="center" mt={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    LLM Aggregator
                </Typography>
            </Box>

            <Box sx={{ maxWidth: "100%", padding: 2 }}>
                <PromptInput onSubmit={handlePromptSubmit} />
            </Box>

            <Box sx={{ maxWidth: "100%", padding: 2 }}>
                <Grid container spacing={2} direction="row">
                    {llms.map((llm, index) => {
                        return (
                            <Grid size={12 / llms.length}>
                                <Chat
                                    llmName={llm}
                                    initialPrompt={initialPrompt}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
};

export default App;
