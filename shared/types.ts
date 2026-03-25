export type ChatRequest = {
    text: string;
};

export type ChatResponse = {
    reply: string;
};

export type Message = {
    role: 'user' | 'assistant';
    text: string;
}