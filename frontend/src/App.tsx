// src/App.tsx
import React, { useState } from "react";
import PromptInput from "./components/PromptInput";
import {
    Typography,
    Box,
    createTheme,
    CssBaseline,
    ThemeProvider,
} from "@mui/material";
import { Chat } from "./components/Chat";
import Grid from "@mui/material/Grid2";

// const llms = ["chatgpt", "claude", "gemini", "llama"];
const llms = ["llama"];

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

const App: React.FC = () => {
    const [initialPrompt, setInitialPrompt] = useState<string>("");
    const handlePromptSubmit = async (prompt: string) => {
        setInitialPrompt(prompt);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
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
        </ThemeProvider>
    );
};

export default App;
