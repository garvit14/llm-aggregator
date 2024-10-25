export enum PromptRole {
    USER = 'user',
    MODEL = 'model'
}

export class Prompt {
    // todo: this is not needed
    role: PromptRole
    message: string
}