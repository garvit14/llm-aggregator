// src/components/ResultCard.tsx
import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

interface ResultCardProps {
    llmName: string;
    result: string; // The LLM result in Markdown format
}

const ResultCard: React.FC<ResultCardProps> = ({ llmName, result }) => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Card sx={{ padding: 2, overflowX: "scroll" }}>
                <Box width="100%" display="flex" justifyContent="flex-end">
                    <IconButton
                        onClick={handleClickOpen}
                        // sx={{ position: "absolute", top: 8, right: 8 }}
                        // sx={{ flex: "" }}
                    >
                        <FullscreenIcon />
                    </IconButton>
                </Box>

                <CardContent>
                    <Typography variant="h6" component="div">
                        {llmName}
                    </Typography>

                    {/* Render the result as Markdown */}
                    <ReactMarkdown>{result}</ReactMarkdown>
                </CardContent>
            </Card>
            {/* Dialog for showing maximized content */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>{llmName}</DialogTitle>
                <DialogContent>
                    <ReactMarkdown>{result}</ReactMarkdown>
                </DialogContent>
                <CardActions>
                    <Button onClick={handleClose}>Close</Button>
                </CardActions>
            </Dialog>
        </>
    );
};

export default ResultCard;
