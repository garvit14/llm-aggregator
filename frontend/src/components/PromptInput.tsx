// src/components/PromptInput.tsx
import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

interface PromptInputProps {
    onSubmit: (prompt: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit }) => {
    const [prompt, setPrompt] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(prompt);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
                label="Enter your prompt"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <Box mt={2}>
                <Button variant="contained" color="primary" type="submit">
                    Submit
                </Button>
            </Box>
        </Box>
    );
};

export default PromptInput;
