const MODEL_KEY_LOCAL_STORAGE = "selectedModels";

export class LocalStorageManager {
    static setSelectedModels(selectedModels: Record<string, Record<string, boolean>>) {
        localStorage.setItem(
            MODEL_KEY_LOCAL_STORAGE,
            JSON.stringify(selectedModels),
        );
    }

    static getSelectedModels(): Record<string, Record<string, boolean>> {
        const selectedModelsStr = localStorage.getItem(MODEL_KEY_LOCAL_STORAGE);
        if (!selectedModelsStr) {
            return {};
        }
        return JSON.parse(selectedModelsStr);
    }
}
