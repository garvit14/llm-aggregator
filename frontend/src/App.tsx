// src/App.tsx
import React, { useEffect, useState, version } from "react";
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
import ModelSelector, { Model, ModelVersion } from "./components/ModelSelector";

// const llms = ["chatgpt", "claude", "gemini", "llama"];
// const llms = ["llama"];

type LLM = {
    name: string;
    version: string;
};

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

// TODO: move APIs in a single file

async function getModels(): Promise<Model[]> {
    console.log("Fetching models...");
    let url = "http://localhost:6765/models";
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching models: ${response.statusText}`);
    }
    let data = await response.json();
    console.log("Fetched models:", data);
    const models: Model[] = data.models.map((model: any) => {
        const versions: ModelVersion[] = model.versions.map(
            (version: string) => {
                return {
                    version: version,
                    isSelected: version === model.defaultVersion,
                };
            },
        );
        return {
            name: model.name,
            displayName: model.displayName,
            isSelected: model.isSelectedByDefault,
            versions: versions,
        };
    });
    return models;
}

const App: React.FC = () => {
    const [initialPrompt, setInitialPrompt] = useState<string>("");
    const [shouldShowModelSelector, setShouldShowModelSelector] =
        useState<boolean>(false);
    // TODO: store this in local storage
    const [models, setModels] = useState<Model[]>([]);
    const handlePromptSubmit = async (prompt: string) => {
        setInitialPrompt(prompt);
    };

    const llms: LLM[] = React.useMemo(
        () =>
            models
                .map((model) => {
                    if (!model.isSelected) {
                        return [];
                    }
                    const selectedVersions = model.versions.filter(
                        (v) => v.isSelected,
                    );
                    return selectedVersions.map((v) => ({
                        name: model.name,
                        version: v.version,
                    }));
                })
                .flat(),
        [models],
    );

    useEffect(() => {
        getModels().then((mdls) => setModels(mdls));
    }, []);

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
                    <PromptInput
                        showModelSelector={() =>
                            setShouldShowModelSelector(true)
                        }
                        onSubmit={handlePromptSubmit}
                    />
                </Box>

                <Box sx={{ maxWidth: "100%", padding: 2 }}>
                    <Grid container spacing={2} direction="row">
                        {llms.map((llm, index) => {
                            return (
                                <Grid size={12 / llms.length}>
                                    <Chat
                                        llmName={llm.name}
                                        llmVersion={llm.version}
                                        initialPrompt={initialPrompt}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Box>
            <ModelSelector
                models={models}
                setModels={setModels}
                open={shouldShowModelSelector}
                onClose={() => setShouldShowModelSelector(false)}
            />
        </ThemeProvider>
    );
};

export default App;
