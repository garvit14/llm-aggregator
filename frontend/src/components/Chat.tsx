import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ReactMarkdown from "react-markdown";
import SendIcon from "@mui/icons-material/Send";
import ThumbUpFilledIcon from "@mui/icons-material/ThumbUp";
import ThumbDownFilledIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDownAltOutlined";

enum Role {
    USER = "user",
    MODEL = "model",
}

interface Message {
    text: string;
    role: Role;
    messageID?: string;
    isLiked: boolean;
    isDisliked: boolean;
}

interface ChatProps {
    llmName: string;
    initialPrompt: string;
}

type Reaction = "like" | "dislike";

async function reactOnMessage(messageID: string, reaction: Reaction) {
    console.log("liking message", messageID);
    let url = `http://localhost:6765/message/like`;
    if (reaction === "dislike") {
        url = `http://localhost:6765/message/dislike`;
    }
    url += `?messageID=${messageID}`;
    const response = await fetch(url, {
        method: "POST",
    });
    if (!response.ok) {
        throw new Error("Error while reacting to message");
    }
    console.log("reacted to message", messageID);
}

async function streamChat(
    setChatID: (chatID: string) => void,
    setMessages: (f: (prev: Message[]) => Message[]) => void,
    prompt: string,
    llm: string,
    chatID?: string,
) {
    console.log("streaming chat...");
    let url = `http://localhost:6765/chat?llm=${llm}&prompt=${prompt}`;
    if (chatID) {
        url += `&chatID=${chatID}`;
    }
    const response = await fetch(url);
    if (!response.ok || response.body === null) {
        console.error("Error while making API call");
        return;
    }

    // create a new message and start streaming the response
    setMessages((prev: Message[]) => [
        ...prev,
        {
            text: "",
            role: Role.MODEL,
            isLiked: false,
            isDisliked: false,
        },
    ]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let result;
    let ndjsonBuffer = "";

    let msg = "";

    while (!(result = await reader.read()).done) {
        const chunk = decoder.decode(result.value, { stream: true });

        // Add the chunk to the buffer
        ndjsonBuffer += chunk;

        console.log("chunk", chunk);

        // Process each complete line of NDJSON
        let lines = ndjsonBuffer.split("\n");
        ndjsonBuffer = lines.pop() as string; // Save incomplete line for later

        lines.forEach((line) => {
            if (line.trim()) {
                try {
                    console.log("line", line);
                    const jsonObject = JSON.parse(line);
                    console.log("Received Data:", jsonObject);
                    msg += jsonObject.response;
                    // append to last message in array
                    setMessages((prev: Message[]) => {
                        prev[prev.length - 1].text = msg;
                        prev[prev.length - 1].messageID = jsonObject.messageID;
                        return [...prev];
                    });
                    if (!chatID) {
                        setChatID(jsonObject.chatID);
                    }
                } catch (error) {
                    console.error("Error parsing JSON line: ", line, error);
                    // throw error;
                }
            }
        });
    }

    console.log("stream done");
}

export const Chat = ({ llmName, initialPrompt }: ChatProps) => {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [prompt, setPrompt] = React.useState("");
    const [chatID, setChatID] = React.useState<string | undefined>(undefined);
    const [open, setOpen] = useState(false);

    console.log(prompt);

    const sendNewMessage = async (msg: string) => {
        setPrompt("");
        // update message in state
        setMessages((prev: Message[]) => {
            return [
                ...prev,
                {
                    text: msg,
                    role: Role.USER,
                    isLiked: false,
                    isDisliked: false,
                },
            ];
        });
        streamChat(setChatID, setMessages, msg, llmName, chatID);
    };

    React.useEffect(() => {
        console.log("initialPrompt", initialPrompt);
        if (!initialPrompt) {
            return;
        }
        // reset history
        setPrompt("");
        setMessages([]);
        setChatID(undefined);
        // send initial prompt
        sendNewMessage(initialPrompt);
    }, [initialPrompt]);

    const UserMessage = ({ msg }: { msg: Message }) => {
        return (
            <Box display="flex" justifyContent="flex-end" marginBottom={1}>
                <Box
                    py={2}
                    px={2}
                    bgcolor="#222324"
                    borderRadius={6}
                    width="fit-content"
                    maxWidth="70%"
                >
                    <Typography style={{ whiteSpace: "pre-line" }}>
                        {msg.text}
                    </Typography>
                </Box>
            </Box>
        );
    };

    const SystemMessage = ({ msg }: { msg: Message }) => {
        const LikeIcon = msg.isLiked ? ThumbUpFilledIcon : ThumbUpIcon;
        const DislikeIcon = msg.isDisliked
            ? ThumbDownFilledIcon
            : ThumbDownIcon;
        return (
            <Box>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                <Box>
                    <IconButton
                        onClick={() =>
                            handleMessageReaction(msg.messageID!, "like")
                        }
                    >
                        <LikeIcon sx={{ color: "green" }} />
                    </IconButton>
                    <IconButton
                        onClick={() =>
                            handleMessageReaction(msg.messageID!, "dislike")
                        }
                    >
                        <DislikeIcon sx={{ color: "red" }} />
                    </IconButton>
                </Box>
            </Box>
        );
    };

    const handleMessageBoxKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
        if (event.key === "Enter" && event.metaKey) {
            // Cmd+Enter was pressed
            console.log("Cmd+Enter pressed");
            // Trigger your function here
            sendNewMessage(prompt);
        }
    };

    const handleMessageReaction = (messageID: string, reaction: Reaction) => {
        reactOnMessage(messageID, reaction);
        messages.forEach((msg) => {
            if (msg.messageID === messageID) {
                if (reaction === "like") {
                    msg.isLiked = true;
                    msg.isDisliked = false;
                } else {
                    msg.isLiked = false;
                    msg.isDisliked = true;
                }
            }
        });
        setMessages([...messages]);
    };

    const content: JSX.Element = React.useMemo(() => {
        return (
            <>
                <Box>
                    {messages.map((msg, index) => {
                        if (msg.role === Role.USER) {
                            return <UserMessage msg={msg} />;
                        } else {
                            return <SystemMessage msg={msg} />;
                        }
                    })}
                </Box>
                {messages.length > 0 && (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        marginTop={5}
                    >
                        <Box width="100%" marginRight={1}>
                            <TextField
                                label="Enter your prompt"
                                variant="outlined"
                                fullWidth
                                multiline
                                maxRows={10}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleMessageBoxKeyDown}
                                size="small"
                            />
                        </Box>
                        <Box>
                            <IconButton onClick={() => sendNewMessage(prompt)}>
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </Box>
                )}
            </>
        );
    }, [messages, prompt]);

    return (
        <Box>
            <Card sx={{ padding: 2, overflowX: "scroll" }}>
                <Box
                    width="100%"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h5">{llmName}</Typography>
                    <IconButton onClick={() => setOpen(true)}>
                        <FullscreenIcon />
                    </IconButton>
                </Box>
                <CardContent>{content}</CardContent>
            </Card>
            {/* Dialog for showing maximized content */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>{llmName}</DialogTitle>
                <DialogContent>{content}</DialogContent>
                <CardActions>
                    <Button onClick={() => setOpen(true)}>Close</Button>
                </CardActions>
            </Dialog>
        </Box>
    );
};
