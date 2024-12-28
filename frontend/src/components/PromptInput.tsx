// src/components/PromptInput.tsx
import React, { useState } from "react";
import { TextField, Button, Box, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import BallotOutlinedIcon from "@mui/icons-material/BallotOutlined";

interface PromptInputProps {
    showModelSelector: () => void;
    onSubmit: (prompt: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
    showModelSelector,
    onSubmit,
}) => {
    const [prompt, setPrompt] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(prompt);
    };

    const handleMessageBoxKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
        if (event.key === "Enter" && event.metaKey) {
            // Cmd+Enter was pressed
            console.log("Cmd+Enter pressed");
            // Trigger your function here
            handleSubmit(event);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2 }}
            position="relative"
        >
            <TextField
                label="Start a new discussion"
                variant="outlined"
                fullWidth
                multiline
                maxRows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleMessageBoxKeyDown}
            />
            <Box mt={2} position="absolute" right="5px" bottom="5px">
                <IconButton onClick={showModelSelector}>
                    <BallotOutlinedIcon />
                </IconButton>
                <IconButton type="submit">
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default PromptInput;
