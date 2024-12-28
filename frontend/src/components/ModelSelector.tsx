import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    Checkbox,
    CheckboxProps,
    FormControlLabel,
    Stack,
} from "@mui/material";
import React from "react";

export interface ModelVersion {
    version: string;
    isSelected: boolean;
}

export interface Model {
    name: string;
    displayName: string;
    isSelected: boolean;
    versions: ModelVersion[];
}

export interface ModelSelectorProps {
    models: Model[];
    setModels: (models: Model[]) => void;
    open: boolean;
    onClose: () => void;
}

const LabeledCheckBox: React.FC<{ label: string } & CheckboxProps> = (
    props,
) => {
    return (
        <FormControlLabel
            control={<Checkbox {...props} />}
            label={props.label}
        />
    );
};

const ModelSelector: React.FC<ModelSelectorProps> = ({
    models,
    setModels,
    open,
    onClose,
}: ModelSelectorProps) => {
    const handleModelSelect = (
        model: Model,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        model.isSelected = event.target.checked;
        setModels([...models]);
    };

    const handleVersionSelect = (
        model: Model,
        version: ModelVersion,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        // don't allow version deselect if only one version of the model is selected
        if (!event.target.checked) {
            const selectedVersions = model.versions.filter((v) => v.isSelected);
            if (selectedVersions.length === 1) {
                return;
            }
        }

        version.isSelected = event.target.checked;
        setModels([...models]);
    };

    const renderModel = (model: Model) => {
        return (
            <Box key={model.name}>
                <LabeledCheckBox
                    label={model.displayName}
                    checked={model.isSelected}
                    onChange={(evt) => handleModelSelect(model, evt)}
                />
                <Stack marginLeft={5}>
                    {model.versions.map((version) => {
                        return (
                            <LabeledCheckBox
                                label={version.version}
                                key={version.version}
                                checked={model.isSelected && version.isSelected}
                                onChange={(evt) =>
                                    handleVersionSelect(model, version, evt)
                                }
                                disabled={!model.isSelected}
                            />
                        );
                    })}
                </Stack>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <Typography variant="h6">Select models</Typography>
            </DialogTitle>
            <DialogContent>
                {models.map((model) => {
                    return renderModel(model);
                })}
            </DialogContent>
        </Dialog>
    );
};

export default ModelSelector;